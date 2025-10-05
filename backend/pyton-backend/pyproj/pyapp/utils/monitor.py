from __future__ import annotations

from pathlib import Path

import pandas as pd


def is_unproductive_streak(path: str | Path, threshold_minutes: int = 10) -> bool:
    file_path = Path(path)
    try:
        df = pd.read_json(file_path, lines=True)
    except ValueError:
        print("File is empty or invalid JSONL.")
        return False

    if df.empty or "productive" not in df.columns:
        print("No data or 'productive' column missing.")
        return False

    recent = df.tail(threshold_minutes)
    return all(str(value).lower() == "false" for value in recent["productive"])


if __name__ == "__main__":
    metrics_path = Path(__file__).resolve().parents[3] / "data-backend" / "metrics.jsonl"
    if is_unproductive_streak(metrics_path, threshold_minutes=10):
        print("Unproductive for 10+ minutes!")
    else:
        print("Still productive or mixed activity.")
