"""Runtime orchestration for ElevenLabs STT → overlay assist workflows."""

from __future__ import annotations

import logging
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, Optional

import requests

from .audio_utils import record_audio
from .stt_elevenlabs import transcribe_audio
from .tts_elevenlabs import speak_text

LOGGER = logging.getLogger(__name__)

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8000")
SCREENSHOT_NAME = os.getenv("OVERLAY_SCREENSHOT", "overlay_capture.png")


def capture_screenshot(output_path: str = SCREENSHOT_NAME) -> Optional[Path]:
    """Capture the current screen (macOS) via `screencapture`."""
    target = Path(output_path)
    try:
        subprocess.run(["screencapture", "-x", str(target)], check=True)
        LOGGER.info("📸 Screenshot captured to %s", target.resolve())
        return target
    except Exception as exc:
        LOGGER.error("Screenshot capture failed: %s", exc)
        return None


def send_to_overlay_assist(prompt_text: str, screenshot_path: Path | None) -> Optional[Dict[str, Any]]:
    """POST transcript + screenshot to the Django overlay endpoint."""
    data = {"prompt": (None, prompt_text)}

    files: Dict[str, tuple[str, Any, str]] = {}
    if screenshot_path and screenshot_path.exists():
        files["screenshot"] = (
            screenshot_path.name,
            screenshot_path.open("rb"),
            "image/png",
        )
        LOGGER.info("📤 Attached screenshot: %s", screenshot_path)
    else:
        LOGGER.warning("No screenshot available; sending prompt only.")

    try:
        response = requests.post(f"{API_BASE}/api/overlay-assist/", data=data, files=files)
        if not response.ok:
            LOGGER.error("Overlay assist failed: %s %s", response.status_code, response.text)
            return None
        payload = response.json()
        LOGGER.info("Overlay assist reply: %s", payload)
        return payload
    except requests.RequestException as exc:
        LOGGER.error("Failed to call overlay assist: %s", exc)
        return None
    finally:
        # Close file handles if we opened one
        for file_info in files.values():
            file_obj = file_info[1]
            file_obj.close()


def process_transcript(audio_file: str, context: str | None = None) -> Optional[Dict[str, Any]]:
    """Transcribe recorded audio, capture screenshot, and call overlay assist."""
    LOGGER.info("Transcribing audio file: %s", audio_file)
    user_text = transcribe_audio(audio_file)
    if not user_text:
        LOGGER.info("No transcription detected; skipping overlay call.")
        return None

    screenshot_path = capture_screenshot()
    overlay_response = send_to_overlay_assist(user_text, screenshot_path)

    reply_text: Optional[str] = None
    if isinstance(overlay_response, dict):
        reply_text = overlay_response.get("reply") or overlay_response.get("response")

    if reply_text:
        LOGGER.info("Speaking overlay reply via ElevenLabs")
        speak_text(reply_text)

    return {
        "transcript": user_text,
        "overlay_response": overlay_response,
        "screenshot_path": str(screenshot_path) if screenshot_path else None,
    }


def run_speech_cycle(duration: int = 5, context: str | None = None) -> Optional[Dict[str, Any]]:
    """Backward-compatible helper: record fixed-duration audio then process."""
    LOGGER.info("Recording for %s seconds…", duration)
    audio_file = record_audio(duration=duration)
    return process_transcript(audio_file, context=context)


def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    print("=== ElevenLabs Push-to-Talk Assistant ===")

    while True:
        result = run_speech_cycle()
        if result is None:
            continue
        again = input("Speak again? (y/n): ").strip().lower()
        if again != "y":
            break


if __name__ == "__main__":
    main()
