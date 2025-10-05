import argparse
import json
import logging
import time
from pathlib import Path
from typing import Optional

import pandas as pd

LOG = logging.getLogger(__name__)


def _load_jsonl(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    if path.stat().st_size == 0:
        raise ValueError(f"File is empty: {path}")
    # Try fast path first via pandas
    try:
        df = pd.read_json(path, lines=True)
        if df.empty:
            raise ValueError(f"No rows found in {path}")
        return df
    except Exception as exc:  # noqa: BLE001
        LOG.warning("Fast JSONL load failed for %s: %s; trying robust path", path, exc)

    # Robust fallback: decode per-line with encoding fallbacks and parse via json
    parsed_rows = []
    skipped = 0
    tried_encodings = ("utf-8", "utf-8-sig", "cp1252", "latin-1")
    with path.open("rb") as fh:
        for raw in fh:
            if not raw.strip():
                continue
            text = None
            for enc in tried_encodings:
                try:
                    text = raw.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            if text is None:
                text = raw.decode("utf-8", errors="replace")
            try:
                parsed_rows.append(json.loads(text))
            except json.JSONDecodeError:
                skipped += 1
    if not parsed_rows:
        raise ValueError(f"No parseable rows in {path}")
    if skipped:
        LOG.warning("Skipped %s malformed JSONL line(s) in %s", skipped, path)
    return pd.DataFrame(parsed_rows)


def _normalise_timestamps(df: pd.DataFrame, column: str = "timestamp") -> pd.DataFrame:
    if column not in df.columns:
        raise KeyError(f"Expected column '{column}' in dataframe")

    df = df.copy()
    df[column] = pd.to_datetime(df[column], errors="coerce")
    df = df.dropna(subset=[column])
    try:
        df[column] = df[column].dt.tz_localize(None)
    except TypeError:
        pass
    df[column] = df[column].dt.floor("min")
    df.sort_values(column, inplace=True)
    return df


def _coerce_productive(value) -> Optional[bool]:
    if isinstance(value, bool) or value is None:
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "1", "yes"}:
            return True
        if lowered in {"false", "0", "no"}:
            return False
    return None


def label_activity_with_productivity(
    screenshot_path: str,
    activity_path: str,
    output_path: str,
) -> int:
    screenshot_file = Path(screenshot_path)
    activity_file = Path(activity_path)
    output_file = Path(output_path)

    ss_df = _load_jsonl(screenshot_file)
    act_df = _load_jsonl(activity_file)

    ss_df = _normalise_timestamps(ss_df)
    act_df = _normalise_timestamps(act_df)

    merged = pd.merge_asof(
        act_df,
        ss_df[["timestamp", "app_name", "window_title", "productive"]],
        on="timestamp",
        direction="backward",
        tolerance=pd.Timedelta("10m"),
    )

    merged["productive"] = merged["productive"].astype(object)
    merged["productive"].fillna("unknown", inplace=True)

    merged["session_change"] = (
        (merged["app_name_x"] != merged["app_name_x"].shift())
        | (merged["window_title_x"] != merged["window_title_x"].shift())
    ).cumsum()

    merged["productive"] = merged.groupby("session_change")["productive"].ffill()

    def infer_future_label(row):
        if row["productive"] != "unknown":
            return row["productive"]

        future_ss = ss_df[
            (ss_df["timestamp"] > row["timestamp"])
            & (ss_df["app_name"] == row.get("app_name_x"))
            & (ss_df["window_title"] == row.get("window_title_x"))
        ]
        if not future_ss.empty:
            future_ss = future_ss.sort_values("timestamp")
            return future_ss.iloc[0]["productive"]
        return "unknown"

    merged["productive"] = merged.apply(infer_future_label, axis=1)

    merged.drop(columns=["session_change"], inplace=True)

    merged.rename(
        columns={
            "app_name_x": "app_name",
            "window_title_x": "window_title",
            "app_name_y": "source_app_name",
            "window_title_y": "source_window_title",
        },
        inplace=True,
    )

    merged["productive"] = merged["productive"].apply(
        lambda value: value if value == "unknown" else _coerce_productive(value)
    )

    output_file.parent.mkdir(parents=True, exist_ok=True)

    json_lines = merged.to_json(orient="records", lines=True, date_format="iso")
    if not json_lines.endswith("\n"):
        json_lines += "\n"

    tmp = output_file.with_suffix(output_file.suffix + ".tmp")
    tmp.write_text(json_lines, encoding="utf-8")
    tmp.replace(output_file)

    return len(merged)


def _run_loop(args) -> None:
    interval = max(1, args.interval)
    while True:
        try:
            count = label_activity_with_productivity(
                args.screenshot_path,
                args.activity_path,
                args.output_path,
            )
            LOG.info("Updated %s with %s rows", args.output_path, count)
        except Exception as exc:  # noqa: BLE001
            LOG.exception("Combiner run failed: %s", exc)
        if args.once:
            break
        time.sleep(interval)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Combine screenshot and activity logs.")
    parser.add_argument("--screenshot-path", default="../../../../data-backend/q_analysis.jsonl")
    parser.add_argument("--activity-path", default="../../../../data-backend/activity.jsonl")
    parser.add_argument("--output-path", default="../../../../data-backend/metrics.jsonl")
    parser.add_argument("--interval", type=int, default=60, help="Seconds between runs when looping")
    parser.add_argument("--once", action="store_true", help="Run a single update then exit")
    return parser


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s")
    parser = build_parser()
    args = parser.parse_args()
    _run_loop(args)


if __name__ == "__main__":
    main()

