from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


def safe_read_jsonl(path: str | Path) -> pd.DataFrame:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    lines = [line.strip() for line in file_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not lines:
        raise ValueError(f"No valid JSON lines found in {file_path}")
    return pd.read_json("\n".join(lines), lines=True)


def compute_hourly_productivity(path: str | Path) -> list[dict]:
    df = safe_read_jsonl(path)
    if not {"productive", "idle_seconds"}.issubset(df.columns):
        raise ValueError("Missing required columns: 'productive' and 'idle_seconds'")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"])
    df["hour"] = df["timestamp"].dt.floor("H")

    df["active_seconds"] = 60 - df["idle_seconds"].clip(lower=0, upper=60)
    df["productive_seconds"] = df["active_seconds"].where(df["productive"] == True, 0)
    df["unproductive_seconds"] = df["active_seconds"].where(df["productive"] == False, 0)

    grouped = df.groupby("hour").agg(
        productive_seconds=("productive_seconds", "sum"),
        unproductive_seconds=("unproductive_seconds", "sum"),
        total_records=("timestamp", "count"),
    )

    grouped["total_active_seconds"] = grouped["productive_seconds"] + grouped["unproductive_seconds"]
    grouped = grouped[grouped["total_active_seconds"] > 0]

    grouped["productive"] = grouped["productive_seconds"] / grouped["total_active_seconds"] * 100
    grouped["unproductive"] = grouped["unproductive_seconds"] / grouped["total_active_seconds"] * 100

    grouped = grouped[["productive", "unproductive"]].round(2)
    grouped.reset_index(inplace=True)
    grouped["hour"] = grouped["hour"].dt.strftime("%Y-%m-%dT%H:%M:%S")

    return grouped.to_dict(orient="records")


if __name__ == "__main__":
    path = Path(__file__).resolve().parents[3] / "data-backend" / "metrics.jsonl"
    hourly_stats = compute_hourly_productivity(path)
    print(json.dumps(hourly_stats, indent=2))
