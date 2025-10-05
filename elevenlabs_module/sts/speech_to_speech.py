"""Runtime orchestration for ElevenLabs speech-to-speech interactions."""

from __future__ import annotations

import logging

try:  # Support running as a package or as a standalone script.
    from .audio_utils import record_audio
    from .stt_elevenlabs import transcribe_audio
    from .llm_client import get_llm_response
    from .tts_elevenlabs import speak_text
except ImportError:  # pragma: no cover - fallback for direct invocation
    from .audio_utils import record_audio
    from .stt_elevenlabs import transcribe_audio
    from .llm_client import get_llm_response
    from .tts_elevenlabs import speak_text

LOGGER = logging.getLogger(__name__)


def run_speech_cycle(duration: int = 5, context: str | None = None) -> dict | None:
    """Execute one capture → transcribe → respond → speak loop."""
    LOGGER.info("Recording for %s seconds…", duration)
    audio_file = record_audio(duration=duration)

    LOGGER.info("Transcribing captured audio: %s", audio_file)
    user_text = transcribe_audio(audio_file)
    if not user_text:
        LOGGER.info("No transcription captured. Prompting retry.")
        print("[INFO] No transcription. Try again.")
        return None

    LOGGER.info("Transcript: %s", user_text)
    llm_response = get_llm_response(user_text, context=context)
    LOGGER.info("LLM response: %s", llm_response)

    LOGGER.info("Speaking response via ElevenLabs")
    speak_text(llm_response)

    return {"transcript": user_text, "response": llm_response}


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
