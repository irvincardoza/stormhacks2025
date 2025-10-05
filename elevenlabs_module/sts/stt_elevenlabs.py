import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# ✅ Resolve .env path correctly even when run from hotkey_runner
CONFIG_DIR = Path(__file__).resolve().parent.parent / "config"
ENV_PATH = CONFIG_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    print(f"[WARN] .env not found at {ENV_PATH}")

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
if not ELEVEN_API_KEY:
    raise RuntimeError("ELEVEN_API_KEY not found in environment — check your .env file!")

# ✅ Correct STT endpoint
STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"

def transcribe_audio(audio_path: str):
    with open(audio_path, "rb") as f:
        files = {"file": f}
        headers = {"xi-api-key": ELEVEN_API_KEY}
        data = {"model_id": "scribe_v1"}


        response = requests.post(STT_URL, headers=headers, files=files, data=data)

    if response.ok:
        text = response.json().get("text", "").strip()
        print(f"[STT] Transcription: {text}")
        return text
    else:
        print("[ERROR] STT failed:", response.text)
        return None
