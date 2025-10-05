"""Push-to-talk hotkey trigger for the ElevenLabs STT → overlay pipeline."""

from __future__ import annotations

import logging
import threading
from contextlib import suppress

try:
    from pynput import keyboard
except ImportError as exc:
    raise SystemExit("Missing dependency 'pynput'. Run `pip install pynput`.") from exc

from .audio_utils import RecordingSession
from .speech_to_speech import process_transcript

LOGGER = logging.getLogger(__name__)

HOLD_KEY = keyboard.KeyCode(char='\\')
CMD_KEYS = {
    keyboard.Key.cmd,
    getattr(keyboard.Key, "cmd_l", keyboard.Key.cmd),
    getattr(keyboard.Key, "cmd_r", keyboard.Key.cmd),
}

STATE = {
    "active": False,
    "session": RecordingSession(debug=True),
    "lock": threading.Lock(),
}

PRESSED: set = set()


def _cmd_active() -> bool:
    return any(key in PRESSED for key in CMD_KEYS)


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
        audio_file = STATE["session"].stop()

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
        LOGGER.info("Transcript: %s", result["transcript"])
        LOGGER.info("Overlay response: %s", result["overlay_response"])
    except Exception as exc:
        LOGGER.error("Error processing transcript: %s", exc)


def on_press(key):
    PRESSED.add(key)
    try:
        if key == HOLD_KEY and _cmd_active():
            start_recording()
        elif key in CMD_KEYS and HOLD_KEY in PRESSED:
            start_recording()
    except Exception as exc:
        LOGGER.error("Error during key press handling: %s", exc)


def on_release(key):
    try:
        if key == HOLD_KEY or key in CMD_KEYS:
            stop_recording()
    except Exception as exc:
        LOGGER.error("Error during key release handling: %s", exc)
    finally:
        PRESSED.discard(key)


def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    LOGGER.info("🎧 Hold Cmd + \\ to talk. Press Ctrl+C to exit.")

    with suppress(KeyboardInterrupt):
        with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
            listener.join()


if __name__ == "__main__":
    main()
