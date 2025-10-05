import os
import json
import time
from dotenv import load_dotenv
from elevenlabs import generate, play, set_api_key

# === Load Environment Variables ===
load_dotenv()

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY") or ""  # <-- add your API key in .env
VOICE_NAME = os.getenv("VOICE_NAME", "alloy")
MODEL_NAME = os.getenv("TTS_MODEL", "eleven_monolingual_v1")
ANALYSIS_FILE_PATH = os.getenv("ANALYSIS_FILE_PATH", "../pyproj/1_analysis.jsonl")
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", 5))
ALERT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", 180))

# Initialize ElevenLabs (only if key provided)
if ELEVEN_API_KEY:
    set_api_key(ELEVEN_API_KEY)
else:
    print("[WARNING] ELEVEN_API_KEY not found. Add it to your .env file.")

# === Helper Functions ===
def get_latest_entry(path: str):
    """Read the last JSON object from the analysis log file."""
    if not os.path.exists(path):
        print(f"[INFO] File not found: {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8") as file:
            lines = file.readlines()
            if not lines:
                return None
            return json.loads(lines[-1])
    except Exception as e:
        print(f"[ERROR] Failed to read analysis file: {e}")
        return None


def speak_alert(reason: str = ""):
    """Trigger ElevenLabs TTS alert."""
    if not ELEVEN_API_KEY:
        print("[ERROR] ElevenLabs API key missing. Cannot play alert.")
        return
    message = "Hey! You've been on this tab for a while now and have lost focus. Time to get back to work!"
    try:
        audio = generate(text=message, voice=VOICE_NAME, model=MODEL_NAME)
        play(audio)
        print(f"[VOICE] Alert spoken: {message}")
    except Exception as e:
        print(f"[ERROR] ElevenLabs playback failed: {e}")


def monitor_focus():
    """Continuously monitor the analysis file for unproductive activity."""
    print("[INFO] Starting focus evaluator...")
    last_timestamp = None
    last_alert_time = 0

    while True:
        entry = get_latest_entry(ANALYSIS_FILE_PATH)
        if not entry:
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        ts = entry.get("timestamp")
        productive = entry.get("productive", True)
        app_name = entry.get("app_name", "Unknown")
        title = entry.get("window_title", "")

        # New entry detected
        if ts != last_timestamp:
            print(f"[INFO] New activity detected → {app_name}: {title}")

            # If unproductive and cooldown elapsed
            if not productive:
                now = time.time()
                if now - last_alert_time >= ALERT_COOLDOWN_SECONDS:
                    print("[ALERT] Unproductive behavior detected.")
                    speak_alert(reason=title)
                    last_alert_time = now
                else:
                    print("[INFO] Cooldown active, skipping alert.")
            else:
                print("[INFO] Activity is productive.")

            last_timestamp = ts

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    monitor_focus()
