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


def compute_context_switches(path: str | Path) -> list[dict]:
    df = safe_read_jsonl(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"])
    df.sort_values("timestamp", inplace=True)
    df["hour"] = df["timestamp"].dt.floor("H")

    df["app_switch"] = df["app_name"] != df["app_name"].shift()
    df["window_switch"] = df["window_title"] != df["window_title"].shift()
    df["context_switch"] = (df["app_switch"] | df["window_switch"]).astype(int)

    if not df.empty:
        df.iloc[0, df.columns.get_loc("context_switch")] = 0

    switches_per_hour = (
        df.groupby("hour")["context_switch"].sum().reset_index(name="switches")
    )
    switches_per_hour["hour"] = switches_per_hour["hour"].dt.strftime("%Y-%m-%dT%H:%M:%S")
    return switches_per_hour.to_dict(orient="records")


if __name__ == "__main__":
    path = Path(__file__).resolve().parents[3] / "data-backend" / "metrics.jsonl"
    hourly_switches = compute_context_switches(path)
    print(json.dumps(hourly_switches, indent=2))
