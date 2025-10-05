from audio_utils import record_audio
from stt_elevenlabs import transcribe_audio
from llm_client import get_llm_response
from tts_elevenlabs import speak_text

def main():
    print("=== ElevenLabs Speech-to-Speech Assistant ===")
    while True:
        # 1. Record user speech
        audio_file = record_audio(duration=5)  # Adjust duration as needed

        # 2. Transcribe speech to text
        user_text = transcribe_audio(audio_file)
        if not user_text:
            print("[INFO] No transcription. Try again.")
            continue

        # 3. Get LLM response
        llm_response = get_llm_response(user_text)

        # 4. Speak LLM response
        speak_text(llm_response)

        # 5. Optionally, ask if user wants to continue
        again = input("Speak again? (y/n): ").strip().lower()
        if again != "y":
            break

if __name__ == "__main__":
    main()