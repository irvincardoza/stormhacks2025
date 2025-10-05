"""Push-to-talk utilities for the ElevenLabs STT → overlay pipeline."""

from __future__ import annotations

import json
import logging
import os
import signal
import sys
import threading
import time
from contextlib import suppress

try:  # Lazy import so overlay mode can run without pynput on minimal installs
    from pynput import keyboard as pynput_keyboard  # type: ignore
except ImportError:  # pragma: no cover - dependency may be absent in overlay builds
    pynput_keyboard = None

from .audio_utils import RecordingSession
from .speech_to_speech import process_transcript

LOGGER = logging.getLogger(__name__)

HOTKEY_MODE = os.getenv("HOTKEY_RUNNER_MODE", "keyboard").strip().lower()
HOTKEY_DEBUG = os.getenv("HOTKEY_DEBUG", "0").lower() in {"1", "true", "yes"}
OUTPUT_FILENAME = os.getenv("HOTKEY_AUDIO_FILE", "user_input.wav")

STATE = {
    "active": False,
    "session": RecordingSession(debug=HOTKEY_DEBUG),
    "lock": threading.Lock(),
}
PRESSED: set = set()

if pynput_keyboard is not None:
    # Push-to-talk now uses Cmd + Shift + R to avoid conflicting with app reload shortcuts.
    HOLD_KEY = pynput_keyboard.KeyCode(char="r")
    CMD_KEYS = {
        pynput_keyboard.Key.cmd,
        getattr(pynput_keyboard.Key, "cmd_l", pynput_keyboard.Key.cmd),
        getattr(pynput_keyboard.Key, "cmd_r", pynput_keyboard.Key.cmd),
    }
    SHIFT_KEYS = {
        pynput_keyboard.Key.shift,
        getattr(pynput_keyboard.Key, "shift_l", pynput_keyboard.Key.shift),
        getattr(pynput_keyboard.Key, "shift_r", pynput_keyboard.Key.shift),
    }
else:  # Fallbacks keep module importable even without pynput
    HOLD_KEY = None
    CMD_KEYS: set = set()
    SHIFT_KEYS: set = set()


def _cmd_active() -> bool:
    return any(key in PRESSED for key in CMD_KEYS)


def _shift_active() -> bool:
    return any(key in PRESSED for key in SHIFT_KEYS)


def _combo_ready() -> bool:
    return _cmd_active() and _shift_active()


def start_recording():
    with STATE["lock"]:
        if STATE["active"]:
            return
        LOGGER.info("🎙️ Recording started (push-to-talk engaged).")
        STATE["session"].start()
        STATE["active"] = True


def stop_recording():
    with STATE["lock"]:
        if not STATE["active"]:
            return
        LOGGER.info("🛑 Recording stopped (push-to-talk released).")
        STATE["active"] = False
        audio_file = STATE["session"].stop(filename=OUTPUT_FILENAME)

    if not audio_file:
        LOGGER.warning("⚠️ No audio captured during this press.")
        return

    threading.Thread(target=_process_async, args=(audio_file,), daemon=True).start()


def _process_async(audio_file: str):
    try:
        result = process_transcript(audio_file)
        if not result:
            LOGGER.warning("⚠️ No overlay response returned.")
            return
        LOGGER.info("Transcript: %s", result.get("transcript"))
        LOGGER.info("Overlay response: %s", result.get("overlay_response"))
    except Exception as exc:  # pragma: no cover - defensive logging for runtime issues
        LOGGER.error("Error processing transcript: %s", exc)


def on_press(key):
    PRESSED.add(key)
    try:
        if key == HOLD_KEY and _combo_ready():
            start_recording()
        elif key in CMD_KEYS and HOLD_KEY in PRESSED and _shift_active():
            start_recording()
        elif key in SHIFT_KEYS and HOLD_KEY in PRESSED and _cmd_active():
            start_recording()
    except Exception as exc:
        LOGGER.error("Error during key press handling: %s", exc)


def on_release(key):
    try:
        if key == HOLD_KEY or key in CMD_KEYS or key in SHIFT_KEYS:
            stop_recording()
    except Exception as exc:
        LOGGER.error("Error during key release handling: %s", exc)
    finally:
        PRESSED.discard(key)


def run_hotkey_listener():
    if pynput_keyboard is None:
        raise SystemExit("Missing dependency 'pynput'. Run `pip install pynput`.")

    LOGGER.info("🎧 Hold Cmd + Shift + R to talk. Press Ctrl+C to exit.")
    with suppress(KeyboardInterrupt):
        with pynput_keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
            listener.join()


def run_overlay_session():
    """Start recording immediately and stop when a termination signal is received."""

    stop_event = threading.Event()
    session = RecordingSession(debug=HOTKEY_DEBUG)

    def _stop_handler(signum, _frame):
        LOGGER.info("Received signal %s; stopping recording.", signum)
        stop_event.set()

    for sig_name in ("SIGTERM", "SIGINT"):
        sig = getattr(signal, sig_name, None)
        if sig is not None:
            signal.signal(sig, _stop_handler)

    LOGGER.info("🎙️ Overlay button engaged; recording in progress.")
    print("[overlay] recording", flush=True)
    session.start()

    try:
        while not stop_event.is_set():
            time.sleep(0.05)
    except KeyboardInterrupt:
        LOGGER.info("Keyboard interrupt received; stopping recording.")
        stop_event.set()

    audio_file = session.stop(filename=OUTPUT_FILENAME)
    if not audio_file:
        LOGGER.warning("No audio captured; nothing to process.")
        print("[overlay] no-audio", flush=True)
        return

    try:
        result = process_transcript(audio_file)
    except Exception as exc:  # pragma: no cover - runtime safeguard
        LOGGER.error("Error processing transcript: %s", exc)
        print(f"[overlay] error: {exc}", flush=True)
        return

    if not result:
        LOGGER.warning("No overlay response returned.")
        print("[overlay] empty-response", flush=True)
        return

    LOGGER.info("Transcript: %s", result.get("transcript"))
    LOGGER.info("Overlay response: %s", result.get("overlay_response"))
    try:
        print(json.dumps(result), flush=True)
    except TypeError:
        print("[overlay] response", flush=True)


def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

    if HOTKEY_MODE == "overlay":
        run_overlay_session()
    else:
        run_hotkey_listener()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # pragma: no cover - entrypoint safeguard
        LOGGER.exception("hotkey_runner terminated unexpectedly: %s", exc)
        sys.exit(1)
