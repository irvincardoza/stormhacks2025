import os
from elevenlabs import generate, play, set_api_key
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "config", ".env"))
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
VOICE_NAME = os.getenv("VOICE_NAME", "Rachel")
MODEL_NAME = os.getenv("TTS_MODEL", "eleven_monolingual_v1")

set_api_key(ELEVEN_API_KEY)

def speak_text(text):
    print(f"[TTS] Speaking: {text}")
    audio = generate(text=text, voice=VOICE_NAME, model=MODEL_NAME)
    play(audio)