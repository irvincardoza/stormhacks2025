"""Global hotkey trigger for the ElevenLabs speech-to-speech + overlay assist pipeline."""

from __future__ import annotations
import logging
import threading
from contextlib import suppress

try:
    from pynput import keyboard
except ImportError as exc:
    raise SystemExit("Missing dependency 'pynput'. Run `pip install pynput`.") from exc

# 🔹 Use full speech-to-speech pipeline instead of raw STT
from .speech_to_speech import run_speech_cycle

LOGGER = logging.getLogger(__name__)
_cycle_lock = threading.Lock()


def _run_cycle_async(duration: int = 5):
    """Record, transcribe, and send to overlay assist asynchronously."""
    if not _cycle_lock.acquire(blocking=False):
        LOGGER.info("Hotkey ignored — another cycle is already running.")
        return

    def _runner():
        try:
            LOGGER.info("🎙️ Starting full speech-to-speech + overlay cycle.")
            result = run_speech_cycle(duration=duration)
            if not result:
                LOGGER.warning("⚠️ No valid transcription or response.")
                return

            print("\n==============================")
            print(f"🗣️ You said: {result['transcript']}")
            if result.get("overlay_response"):
                print("📸 Screenshot + prompt successfully sent to overlay endpoint.")
                print(f"🤖 Overlay replied: {result['overlay_response']}")
            else:
                print("⚠️ No overlay response received.")
            print("==============================\n")

        except Exception as e:
            LOGGER.error("❌ Error during speech cycle: %s", e)
        finally:
            _cycle_lock.release()
            LOGGER.info("✅ Speech cycle completed.")

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
