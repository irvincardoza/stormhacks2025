"""Global hotkey entry point for the ElevenLabs speech-to-text tester."""

from __future__ import annotations
import logging
import threading
from contextlib import suppress
from pathlib import Path

try:
    from pynput import keyboard
except ImportError as exc:
    raise SystemExit("Missing dependency 'pynput'. Run `pip install pynput`.") from exc

# ✅ Use your local modules
from .audio_utils import record_audio
from .stt_elevenlabs import transcribe_audio

LOGGER = logging.getLogger(__name__)
_cycle_lock = threading.Lock()


def _run_cycle_async(duration: int = 5):
    """Record a short clip and send it to ElevenLabs STT."""
    if not _cycle_lock.acquire(blocking=False):
        LOGGER.info("Hotkey ignored — another STT cycle is running.")
        return

    def _runner():
        try:
            LOGGER.info("🎙️ Recording for %s seconds...", duration)
            audio_path = record_audio(duration=duration)
            LOGGER.info("📁 Audio saved to %s", audio_path)

            text = transcribe_audio(audio_path)
            if text:
                LOGGER.info("[STT Result] %s", text)
                print(f"\n🗣️ You said: {text}\n")
            else:
                LOGGER.warning("⚠️ No transcription detected.")
        finally:
            _cycle_lock.release()
            LOGGER.info("✅ STT cycle finished.")

    threading.Thread(target=_runner, daemon=True).start()


def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    combo = "<ctrl>+<shift>+<space>"
    LOGGER.info("🎧 Listening for %s — press Ctrl+C to exit.", combo)

    hotkeys = {combo: lambda: _run_cycle_async()}

    with suppress(KeyboardInterrupt):
        with keyboard.GlobalHotKeys(hotkeys) as listener:
            listener.join()


if __name__ == "__main__":
    main()
