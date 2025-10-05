import os
import json
from dotenv import load_dotenv
from elevenlabs import generate, play, set_api_key

# === Load Environment Variables ===
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "config", ".env"))

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY") or ""
VOICE_NAME = os.getenv("VOICE_NAME", "alloy")
MODEL_NAME = os.getenv("TTS_MODEL", "eleven_monolingual_v1")
ANALYSIS_FILE_PATH = os.getenv("ANALYSIS_FILE_PATH", "test_analysis.jsonl")

if ELEVEN_API_KEY:
    set_api_key(ELEVEN_API_KEY)
else:
    print("[WARNING] ELEVEN_API_KEY not found. Add it to your .env file.")

def get_latest_entry(path: str):
    if not os.path.exists(path):
        print(f"[ERROR] File not found: {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            if not lines:
                print("[ERROR] File is empty.")
                return None
            return json.loads(lines[-1])
    except Exception as e:
        print(f"[ERROR] Failed to read file: {e}")
        return None

def speak_alert():
    if not ELEVEN_API_KEY:
        print("[ERROR] No API key set.")
        return
    text = "Hey! You've been on this tab for a while now and have lost focus. Time to get back to work!"
    audio = generate(text=text, voice=VOICE_NAME, model=MODEL_NAME)
    play(audio)
    print("[VOICE] Alert spoken.")

if __name__ == "__main__":
    entry = get_latest_entry(ANALYSIS_FILE_PATH)
    if entry:
        print(f"[INFO] Latest entry: {entry}")
        if not entry.get("productive", True):
            print("[ALERT] Unproductive behavior detected.")
            speak_alert()
        else:
            print("[INFO] Activity is productive.")