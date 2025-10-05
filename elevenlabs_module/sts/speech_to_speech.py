"""Runtime orchestration for ElevenLabs speech-to-speech interactions."""

from __future__ import annotations
import logging
import requests
import os
import subprocess
from datetime import datetime
from pathlib import Path

try:
    from .audio_utils import record_audio
    from .stt_elevenlabs import transcribe_audio
    from .llm_client import get_llm_response
    from .tts_elevenlabs import speak_text
except ImportError:
    from audio_utils import record_audio
    from stt_elevenlabs import transcribe_audio
    from llm_client import get_llm_response
    from tts_elevenlabs import speak_text


LOGGER = logging.getLogger(__name__)

# 🔹 Your Django backend URL (adjust if running elsewhere)
API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8000")


# ======================================================
#  📸 Screenshot Capture (macOS version)
# ======================================================
def capture_screenshot(output_path: str = "overlay_capture.png") -> str | None:
    """
    Capture a screenshot (macOS only) using the built-in `screencapture` command.
    """
    try:
        path = Path(output_path)
        subprocess.run(["screencapture", "-x", str(path)], check=True)
        print(f"📸 Screenshot captured to {path.resolve()}")
        return str(path)
    except Exception as e:
        print(f"[ERROR] Screenshot capture failed: {e}")
        return None


# ======================================================
#  🔹 Overlay Assist API Call
# ======================================================
def send_to_overlay_assist(prompt_text: str, screenshot_path: str | None):
    """
    Sends transcription text + screenshot to Django backend /api/overlay-assist/.
    """
    try:
        form = {"prompt": (None, prompt_text)}

        if screenshot_path and os.path.exists(screenshot_path):
            files = {
                "screenshot": (
                    os.path.basename(screenshot_path),
                    open(screenshot_path, "rb"),
                    "image/png",
                )
            }
            print(f"📤 Attached screenshot: {screenshot_path}")
        else:
            files = {}
            print("⚠️ No screenshot found — sending prompt only.")

        resp = requests.post(f"{API_BASE}/api/overlay-assist/", files=files, data=form)
        if not resp.ok:
            LOGGER.error("❌ Overlay assist failed: %s %s", resp.status_code, resp.text)
            return None

        result = resp.json()
        LOGGER.info("✅ Overlay assist response: %s", result)
        print(f"\n🗣️ Sent text: {prompt_text}")
        print("✅ Overlay assist successful.\n")
        return result

    except Exception as e:
        LOGGER.error("Failed to send to overlay assist: %s", e)
        return None


# ======================================================
#  🎤 Full Speech → Text → Screenshot → Assist → Speech Cycle
# ======================================================
def run_speech_cycle(duration: int = 5, context: str | None = None) -> dict | None:
    """Execute one capture → transcribe → screenshot → send → speak loop."""
    LOGGER.info("Recording for %s seconds…", duration)
    audio_file = record_audio(duration=duration)

    LOGGER.info("Transcribing captured audio: %s", audio_file)
    user_text = transcribe_audio(audio_file)
    if not user_text:
        LOGGER.info("No transcription captured. Try again.")
        print("[INFO] No transcription. Try again.")
        return None

    # 🔹 Step 1: Take a screenshot
    screenshot_path = capture_screenshot("overlay_capture.png")

    # 🔹 Step 2: Send transcription + screenshot to backend
    overlay_response = send_to_overlay_assist(user_text, screenshot_path)

    # 🔹 Step 3: Optionally get LLM + TTS response
    llm_response = get_llm_response(user_text, context=context)
    LOGGER.info("LLM response: %s", llm_response)

    LOGGER.info("Speaking response via ElevenLabs")
    speak_text(llm_response)

    return {
        "transcript": user_text,
        "overlay_response": overlay_response,
        "response": llm_response,
    }


# ======================================================
#  🚀 Entry Point
# ======================================================
def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    print("=== ElevenLabs Speech-to-Speech Assistant ===")

    while True:
        result = run_speech_cycle()
        if result is None:
            continue

        again = input("Speak again? (y/n): ").strip().lower()
        if again != "y":
            break


if __name__ == "__main__":
    main()
