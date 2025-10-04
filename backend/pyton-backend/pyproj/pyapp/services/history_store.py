import json
from .paths import HISTORY_FILE

def append_history(entry: dict) -> None:
    """Append one JSON object per line."""
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def read_history() -> list:
    """Return all entries as a list."""
    items = []
    if not HISTORY_FILE.exists():
        return items
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                items.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return items
