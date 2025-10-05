import os
import json
import time
import sys
from dotenv import load_dotenv

# Import notifier from sibling module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from notifier.notifier import speak_alert

# === Load environment variables ===
load_dotenv()

ANALYSIS_FILE_PATH = os.getenv("ANALYSIS_FILE_PATH", "../pyproj/1_analysis.jsonl")
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", 5))
ALERT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", 180))


def read_latest_entry(file_path: str):
    """Reads the most recent JSON line from the analysis file."""
    if not os.path.exists(file_path):
        print(f"[INFO] File not found: {file_path}")
        return None

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            if not lines:
                return None
            return json.loads(lines[-1])
    except Exception as e:
        print(f"[ERROR] Failed to read {file_path}: {e}")
        return None


def monitor_focus():
    """Monitors JSONL file for productivity changes and triggers alerts."""
    print("[INFO] ElevenLabs focus monitor started.")
    last_timestamp = None
    last_alert_time = 0

    while True:
        entry = read_latest_entry(ANALYSIS_FILE_PATH)
        if not entry:
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        timestamp = entry.get("timestamp")
        productive = entry.get("productive", True)
        app_name = entry.get("app_name", "Unknown")
        window_title = entry.get("window_title", "")

        if timestamp != last_timestamp:
            print(f"[INFO] New activity detected → {app_name}: {window_title}")

            if not productive:
                now = time.time()
                if now - last_alert_time >= ALERT_COOLDOWN_SECONDS:
                    print("[ALERT] Unproductive activity detected. Triggering voice alert.")
                    speak_alert(reason=window_title)
                    last_alert_time = now
                else:
                    print("[INFO] Cooldown active, skipping alert.")
            else:
                print("[INFO] Activity marked as productive.")

            last_timestamp = timestamp

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        monitor_focus()
    except KeyboardInterrupt:
        print("\n[INFO] Monitor stopped by user.")
