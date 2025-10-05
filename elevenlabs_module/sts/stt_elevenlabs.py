import os
import requests

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "config", ".env"))
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
STT_URL = "https://api.elevenlabs.io/v1/speech-to-text/convert"

def transcribe_audio(audio_path):
    with open(audio_path, "rb") as f:
        audio_data = f.read()
    response = requests.post(
        STT_URL,
        headers={"xi-api-key": ELEVEN_API_KEY},
        files={"audio": audio_data}
    )
    if response.ok:
        text = response.json()["text"]
        print(f"[STT] Transcription: {text}")
        return text
    else:
        print("[ERROR] STT failed:", response.text)
        return None