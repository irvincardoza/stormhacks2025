import os
from dotenv import load_dotenv
from elevenlabs import generate, play, set_api_key

# === Load environment variables ===
load_dotenv()

# Pull from .env
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY") or ""  # <-- Add your API key in .env
VOICE_NAME = os.getenv("VOICE_NAME", "alloy")
MODEL_NAME = os.getenv("TTS_MODEL", "eleven_monolingual_v1")

# Initialize ElevenLabs if key exists
if ELEVEN_API_KEY:
    set_api_key(ELEVEN_API_KEY)
else:
    print("[WARNING] ELEVEN_API_KEY not found in .env file. Voice alerts will be disabled.")

def speak_alert(reason: str = ""):
    """
    Triggers an ElevenLabs voice alert when user is unproductive.
    """
    if not ELEVEN_API_KEY:
        print("[ERROR] ElevenLabs API key missing. Cannot generate speech.")
        return

    message = "Hey! You've been on this tab for a while now and have lost focus. Time to get back to work!"
    try:
        audio = generate(
            text=message,
            voice=VOICE_NAME,
            model=MODEL_NAME
        )
        play(audio)
        print(f"[VOICE] Played alert: {message}")
    except Exception as e:
        print(f"[ERROR] ElevenLabs TTS generation or playback failed: {e}")
