from __future__ import annotations

from pathlib import Path

import pandas as pd


def compute_productivity_stats(path: str | Path) -> dict:
    file_path = Path(path)
    df = pd.read_json(file_path, lines=True)

    if not {"productive", "idle_seconds"}.issubset(df.columns):
        raise ValueError("Missing required columns: 'productive' and 'idle_seconds'")

    df["active_seconds"] = 60 - df["idle_seconds"].clip(lower=0, upper=60)

    productive_seconds = df.loc[df["productive"] == True, "active_seconds"].sum()
    unproductive_seconds = df.loc[df["productive"] == False, "active_seconds"].sum()
    idle_seconds_total = df["idle_seconds"].sum()

    total_seconds = len(df) * 60
    if total_seconds == 0:
        raise ValueError("No activity records available")

    stats = {
        "productive": round(productive_seconds / total_seconds * 100, 2),
        "unproductive": round(unproductive_seconds / total_seconds * 100, 2),
        "idle": round(idle_seconds_total / total_seconds * 100, 2),
        "total_minutes": len(df),
    }
    return stats


if __name__ == "__main__":
    metrics_path = Path(__file__).resolve().parents[3] / "data-backend" / "metrics.jsonl"
    stats = compute_productivity_stats(metrics_path)
    print("Productivity Summary:")
    for key, value in stats.items():
        print(f"{key}: {value}")
