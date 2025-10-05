# pyapp/services/history_store.py
import json
from .paths import HISTORY_FILE

def append_history(entry: dict) -> None:
    """Append one JSON object per line to q_analysis.jsonl."""
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
