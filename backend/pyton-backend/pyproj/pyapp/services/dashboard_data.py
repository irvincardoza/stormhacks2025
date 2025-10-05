from __future__ import annotations

import json
from collections import Counter
from datetime import timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

import pandas as pd
from django.conf import settings
from django.utils import timezone

from .paths import (
    CONTEXT_SWITCHES_FILE,
    HOURLY_FILE,
    METRICS_FILE,
    MONITOR_FILE,
    SUMMARY_FILE,
)


COLORS = {
    "productive": "hsl(var(--chart-1))",
    "unproductive": "hsl(var(--chart-2))",
    "neutral": "hsl(var(--chart-3))",
    "idle": "hsl(var(--chart-4))",
    "other": "hsl(var(--chart-5))",
    "switches": "hsl(var(--chart-1))",
    "focus": "hsl(var(--chart-2))",
    "meetings": "hsl(var(--chart-3))",
    "breaks": "hsl(var(--chart-4))",
    "apps_primary": "hsl(var(--chart-1))",
    "apps_secondary": "hsl(var(--chart-2))",
}


def _normalise_bool(value: Any) -> Optional[bool]:
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return bool(value)
    text = str(value).strip().lower()
    if text in {"true", "productive", "1", "yes"}:
        return True
    if text in {"false", "unproductive", "0", "no"}:
        return False
    return None


def _load_json_file(path: Path) -> Optional[Any]:
    if not path.exists() or path.stat().st_size == 0:
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def _load_json_array(path: Path) -> list[dict]:
    payload = _load_json_file(path)
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    return []


def _parse_timestamp(value: Any) -> Optional[pd.Timestamp]:
    if value in (None, ""):
        return None
    try:
        ts = pd.to_datetime(value, utc=True, errors="coerce")
    except (ValueError, TypeError):
        return None
    if pd.isna(ts):
        return None
    tz = timezone.get_current_timezone()
    try:
        return ts.tz_convert(tz)
    except TypeError:
        # Naive timestamp -> localise then convert
        return ts.tz_localize(tz)


def _format_time_label(ts: pd.Timestamp, fmt: str = "%H:%M") -> str:
    return ts.strftime(fmt)


def _load_metrics_dataframe() -> Optional[pd.DataFrame]:
    if not METRICS_FILE.exists() or METRICS_FILE.stat().st_size == 0:
        return None
    try:
        df = pd.read_json(METRICS_FILE, lines=True)
    except ValueError:
        return None

    if df.empty:
        return None

    ts = pd.to_datetime(df.get("timestamp"), utc=True, errors="coerce")
    ts = ts.dropna()
    if ts.empty:
        return None

    tz = timezone.get_current_timezone()
    try:
        df["timestamp"] = ts.dt.tz_convert(tz)
    except TypeError:
        df["timestamp"] = ts.dt.tz_localize(tz)

    df = df.sort_values("timestamp").reset_index(drop=True)

    df["idle_seconds"] = pd.to_numeric(df.get("idle_seconds"), errors="coerce").fillna(0.0)
    df["idle_seconds"] = df["idle_seconds"].clip(lower=0, upper=3600)

    df["active_seconds"] = (60.0 - df["idle_seconds"].clip(upper=60.0)).clip(lower=0.0)
    df["productive_bool"] = df.get("productive").apply(_normalise_bool)

    df["productivity_label"] = df["productive_bool"].map(
        {True: "productive", False: "unproductive"}
    ).fillna("neutral")

    df["timestamp_hour"] = df["timestamp"].dt.floor("H")
    df["hour_label"] = df["timestamp"].apply(_format_time_label)

    df["app_name"] = df.get("app_name", "unknown").fillna("unknown")
    df["window_title"] = df.get("window_title", "unknown").fillna("unknown")

    df["productive_seconds"] = df["active_seconds"].where(df["productive_bool"] == True, 0.0)
    df["unproductive_seconds"] = df["active_seconds"].where(df["productive_bool"] == False, 0.0)

    return df


def _chart_config(labels: Iterable[str], color_cycle: Iterable[str]) -> Dict[str, Dict[str, str]]:
    config: Dict[str, Dict[str, str]] = {}
    colors = list(color_cycle)
    for idx, key in enumerate(labels):
        color = colors[idx % len(colors)] if colors else COLORS["productive"]
        config[key] = {"label": key, "color": color}
    return config


def build_overview_section(df: Optional[pd.DataFrame]) -> Optional[dict]:
    summary = _load_json_file(SUMMARY_FILE) or {}
    slices = []
    for key, label in (
        ("productive", "Productive"),
        ("unproductive", "Unproductive"),
        ("neutral", "Neutral"),
        ("idle", "Idle"),
    ):
        value = float(summary.get(key, 0.0))
        if value <= 0 and label != "Idle":
            continue
        color = COLORS.get(key, COLORS["other"])
        slices.append({"name": label, "value": round(value, 2), "color": color})

    if not slices:
        # Provide at least a placeholder slice for the UI
        slices.append({"name": "Productive", "value": 0.0, "color": COLORS["productive"]})

    breakdown_config = {
        item["name"]: {"label": item["name"], "color": item["color"]} for item in slices
    }

    hourly_records = _load_json_array(HOURLY_FILE)
    hourly_points = []
    for row in sorted(hourly_records, key=lambda item: item.get("hour", "")):
        ts = _parse_timestamp(row.get("hour"))
        if not ts:
            continue
        hourly_points.append(
            {
                "name": _format_time_label(ts),
                "productive": round(float(row.get("productive", 0.0)), 2),
                "unproductive": round(float(row.get("unproductive", 0.0)), 2),
            }
        )

    hourly_config = {
        "productive": {"label": "Productive", "color": COLORS["productive"]},
        "unproductive": {"label": "Unproductive", "color": COLORS["unproductive"]},
    }

    context_records = _load_json_array(CONTEXT_SWITCHES_FILE)
    context_points = []
    for row in sorted(context_records, key=lambda item: item.get("hour", "")):
        ts = _parse_timestamp(row.get("hour"))
        if not ts:
            continue
        context_points.append(
            {
                "name": _format_time_label(ts),
                "switches": int(row.get("switches", 0)),
            }
        )

    context_config = {
        "switches": {"label": "Switches", "color": COLORS["switches"]},
    }

    weekly_points = []
    if df is not None and not df.empty:
        weekly_stats = []
        grouped = df.groupby(df["timestamp"].dt.date)
        for date, group in grouped:
            total_active = group["active_seconds"].sum()
            if total_active <= 0:
                continue
            productive_seconds = group["productive_seconds"].sum()
            pct = round((productive_seconds / total_active) * 100.0, 2)
            weekly_stats.append((date, pct))
        weekly_stats = weekly_stats[-7:]
        weekly_points = [
            {"name": pd.Timestamp(date).strftime("%a"), "productivity": pct}
            for date, pct in weekly_stats
        ]

    weekly_config = {
        "productivity": {"label": "Productivity", "color": COLORS["unproductive"]},
    }

    return {
        "productivityBreakdown": {"slices": slices, "config": breakdown_config},
        "hourlyProductivity": {
            "points": hourly_points,
            "config": hourly_config,
        },
        "contextSwitchTrend": {
            "points": context_points,
            "config": context_config,
        },
        "weeklyProductivity": {
            "points": weekly_points,
            "config": weekly_config,
        },
    }


def build_idle_section(df: Optional[pd.DataFrame]) -> Optional[dict]:
    if df is None or df.empty:
        return None

    idle_group = (
        df.groupby("timestamp_hour")["idle_seconds"].sum().reset_index(name="idle_seconds")
    )
    idle_points = [
        {
            "name": _format_time_label(row["timestamp_hour"], "%H:%M"),
            "idleMin": round(row["idle_seconds"] / 60.0, 2),
        }
        for _, row in idle_group.iterrows()
    ]

    idle_config = {
        "idleMin": {"label": "Idle Minutes", "color": COLORS["idle"]},
    }

    long_breaks = []
    current_break: Optional[dict] = None
    threshold_seconds = int(getattr(settings, "TRACKLET_LONG_BREAK_SECONDS", 600))

    for _, row in df.iterrows():
        idle_seconds = float(row["idle_seconds"])
        ts: pd.Timestamp = row["timestamp"]
        if idle_seconds >= threshold_seconds:
            start_time = ts - timedelta(seconds=idle_seconds)
            if current_break is None:
                current_break = {"start": start_time, "end": ts}
            else:
                current_break["end"] = ts
        elif current_break is not None:
            duration = (current_break["end"] - current_break["start"]).total_seconds() / 60.0
            if duration >= threshold_seconds / 60:
                long_breaks.append(
                    {
                        "start": current_break["start"].isoformat(),
                        "end": current_break["end"].isoformat(),
                        "durationMin": int(round(duration)),
                        "reason": "Extended idle",
                    }
                )
            current_break = None

    if current_break is not None:
        duration = (current_break["end"] - current_break["start"]).total_seconds() / 60.0
        long_breaks.append(
            {
                "start": current_break["start"].isoformat(),
                "end": current_break["end"].isoformat(),
                "durationMin": int(round(duration)),
                "reason": "Extended idle",
            }
        )

    tracked_minutes = int(round(df["active_seconds"].sum() / 60.0))

    return {
        "idleOverTime": {"points": idle_points, "config": idle_config},
        "longBreaks": long_breaks,
        "trackedMinutes": tracked_minutes,
    }


def build_apps_section(df: Optional[pd.DataFrame]) -> Optional[dict]:
    if df is None or df.empty:
        return None

    app_group = df.groupby("app_name").agg(
        active_seconds=("active_seconds", "sum"),
        productive_seconds=("productive_seconds", "sum"),
        unproductive_seconds=("unproductive_seconds", "sum"),
        sessions=("timestamp", "count"),
    )
    if app_group.empty:
        return None

    usage_points = []
    prod_vs_unprod = []
    session_rows = []

    top_apps = app_group.sort_values("active_seconds", ascending=False).head(5)
    for app, row in top_apps.iterrows():
        minutes = round(row["active_seconds"] / 60.0, 2)
        prod_pct = (
            (row["productive_seconds"] / row["active_seconds"] * 100.0)
            if row["active_seconds"] > 0
            else 0.0
        )
        usage_points.append(
            {
                "name": app,
                "time": minutes,
                "productivity": round(prod_pct, 2),
            }
        )
        prod_vs_unprod.append(
            {
                "name": app,
                "productive": round(row["productive_seconds"] / 60.0, 2),
                "unproductive": round(row["unproductive_seconds"] / 60.0, 2),
            }
        )

        avg_session = minutes / row["sessions"] if row["sessions"] else 0.0
        session_rows.append(
            {
                "app": app,
                "domain": None,
                "totalTime": round(minutes, 2),
                "sessions": int(row["sessions"]),
                "avgSession": round(avg_session, 2),
                "productivity": round(prod_pct, 2),
            }
        )

    usage_config = {
        "time": {"label": "Time (minutes)", "color": COLORS["apps_primary"]},
        "productivity": {"label": "Productivity", "color": COLORS["apps_secondary"]},
    }

    prod_config = {
        "productive": {"label": "Productive", "color": COLORS["productive"]},
        "unproductive": {"label": "Unproductive", "color": COLORS["unproductive"]},
    }

    category_slices = [
        {"name": "Productive", "value": round(df["productive_seconds"].sum() / 60.0, 2), "color": COLORS["productive"]},
        {"name": "Unproductive", "value": round(df["unproductive_seconds"].sum() / 60.0, 2), "color": COLORS["unproductive"]},
        {"name": "Idle", "value": round(df["idle_seconds"].sum() / 60.0, 2), "color": COLORS["idle"]},
    ]
    category_config = {
        slice_["name"]: {"label": slice_["name"], "color": slice_["color"]} for slice_ in category_slices
    }

    return {
        "usageByApp": {"points": usage_points, "config": usage_config},
        "categoryDistribution": {"slices": category_slices, "config": category_config},
        "productiveVsUnproductive": {"points": prod_vs_unprod, "config": prod_config},
        "sessions": session_rows,
    }


def build_switches_section(df: Optional[pd.DataFrame]) -> Optional[dict]:
    context_records = _load_json_array(CONTEXT_SWITCHES_FILE)
    if df is None and not context_records:
        return None

    switches_points = []
    for row in sorted(context_records, key=lambda item: item.get("hour", "")):
        ts = _parse_timestamp(row.get("hour"))
        if not ts:
            continue
        switches_points.append(
            {"name": _format_time_label(ts), "switches": int(row.get("switches", 0))}
        )

    switches_config = {
        "switches": {"label": "Switches", "color": COLORS["switches"]},
    }

    intensity_points = []
    if df is not None and not df.empty:
        counts = df.groupby("timestamp_hour").apply(
            lambda group: int((group["app_name"] != group["app_name"].shift()).sum())
        )
        for ts, value in counts.items():
            intensity_points.append(
                {"name": _format_time_label(ts, "%H:%M"), "count": int(value)}
            )

    intensity_config = {
        "count": {"label": "Switches", "color": COLORS["unproductive"]},
    }

    top_pairs = []
    if df is not None and not df.empty:
        shifted = df.shift(1)
        mask = df["app_name"] != shifted["app_name"]
        transitions = df[mask & shifted["app_name"].notna()]
        pairs = Counter(zip(shifted.loc[transitions.index, "app_name"], transitions["app_name"]))
        for (from_app, to_app), count in pairs.most_common(8):
            top_pairs.append({"from": from_app, "to": to_app, "count": int(count)})

    return {
        "switchesOverTime": {"points": switches_points, "config": switches_config},
        "switchIntensity": {"points": intensity_points, "config": intensity_config},
        "topPairs": top_pairs,
    }


def build_timeline_section(df: Optional[pd.DataFrame]) -> Optional[dict]:
    if df is None or df.empty:
        return None

    app_totals = df.groupby("app_name")["active_seconds"].sum().sort_values(ascending=False)
    top_apps = list(app_totals.head(5).index)

    grouped = df.groupby(["timestamp_hour", "app_name"]) ["active_seconds"].sum().unstack(fill_value=0.0)
    timeline_points = []
    for ts, row in grouped.iterrows():
        point = {"name": ts.strftime("%H:%M")}
        others = 0.0
        for app in row.index:
            minutes = round(row[app] / 60.0, 2)
            if app in top_apps:
                point[app] = minutes
            else:
                others += minutes
        if others:
            point["Other"] = round(others, 2)
        timeline_points.append(point)

    series_keys = sorted({key for point in timeline_points for key in point.keys() if key != "name"})
    colors_cycle = [COLORS["productive"], COLORS["unproductive"], COLORS["neutral"], COLORS["idle"], COLORS["other"]]
    timeline_config = _chart_config(series_keys, colors_cycle)

    events = []
    for _, row in df.tail(200).iterrows():
        events.append(
            {
                "ts": row["timestamp"].isoformat(),
                "app": row["app_name"],
                "window": row["window_title"],
                "domain": None,
                "idleSec": float(row["idle_seconds"]),
                "category": row["productivity_label"],
                "productivity": row["productivity_label"],
            }
        )

    return {
        "dailyTimeline": {"points": timeline_points, "config": timeline_config},
        "activityEvents": events,
    }


def build_focus_section(df: Optional[pd.DataFrame]) -> Optional[dict]:
    if df is None or df.empty:
        return None

    focus_df = df[df["productive_bool"] == True].copy()
    if focus_df.empty:
        return None

    focus_df["gap"] = focus_df["timestamp"] - focus_df["timestamp"].shift(1)
    focus_df["session_id"] = ((focus_df["app_name"] != focus_df["app_name"].shift(1)) | (focus_df["gap"] > pd.Timedelta(minutes=5))).cumsum()

    sessions = []
    for session_id, group in focus_df.groupby("session_id"):
        start = group["timestamp"].iloc[0]
        end = group["timestamp"].iloc[-1] + pd.Timedelta(minutes=1)
        duration = group["active_seconds"].sum()
        app = group["app_name"].iloc[-1]
        window = group["window_title"].iloc[-1]
        sessions.append(
            {
                "id": f"session-{int(session_id)}",
                "start": start.isoformat(),
                "end": end.isoformat(),
                "durationSec": int(duration),
                "app": app,
                "window": window,
                "productivity": "productive",
            }
        )

    category_minutes = (
        focus_df.groupby("app_name")["active_seconds"].sum().sort_values(ascending=False)
    )
    category_points = [
        {"name": app, "minutes": round(seconds / 60.0, 2)}
        for app, seconds in category_minutes.head(6).items()
    ]
    category_config = {
        "minutes": {"label": "Focus minutes", "color": COLORS["productive"]},
    }

    session_distribution = []
    buckets = [(0, 15), (15, 30), (30, 45), (45, 60), (60, 90), (90, None)]
    counts = Counter()
    for session in sessions:
        minutes = session["durationSec"] / 60.0
        for low, high in buckets:
            upper = high if high is not None else float("inf")
            if low <= minutes < upper:
                label = f"{low}-{int(high)}m" if high is not None else f"{low}m+"
                counts[label] += 1
                break
    for label in (
        "0-15m",
        "15-30m",
        "30-45m",
        "45-60m",
        "60-90m",
        "90m+",
    ):
        session_distribution.append({"name": label, "sessions": counts.get(label, 0)})

    session_config = {
        "sessions": {"label": "Sessions", "color": COLORS["productive"]},
    }

    trend_points = []
    hourly_focus = focus_df.groupby("timestamp_hour")["productive_seconds"].sum()
    for ts, value in hourly_focus.items():
        trend_points.append(
            {"name": ts.strftime("%H:%M"), "focus": round(value / 60.0 * 10, 2)}
        )
    trend_config = {
        "focus": {"label": "Focus score", "color": COLORS["focus"]},
    }

    goal_minutes = int(getattr(settings, "TRACKLET_DAILY_GOAL_MINUTES", 180))

    return {
        "sessions": sessions[-10:],
        "categoryMinutes": {"points": category_points, "config": category_config},
        "sessionDistribution": {"points": session_distribution, "config": session_config},
        "focusScoreTrend": {"points": trend_points, "config": trend_config},
        "goalMinutes": goal_minutes,
    }


def build_settings_section() -> dict:
    status = _load_json_file(MONITOR_FILE) or {}
    return {
        "thresholds": {
            "sessionSeconds": int(getattr(settings, "TRACKLET_SESSION_THRESHOLD", 900)),
            "idleSeconds": int(getattr(settings, "TRACKLET_IDLE_THRESHOLD", 300)),
            "breakMinutes": int(getattr(settings, "TRACKLET_BREAK_MINUTES", 15)),
        },
        "rules": [],
        "privacy": {
            "redactFilenames": bool(getattr(settings, "TRACKLET_REDACT_FILENAMES", False)),
            "hideScreenshots": False,
            "anonymizeDomains": False,
        },
        "dataManagement": {
            "retentionDays": int(getattr(settings, "TRACKLET_RETENTION_DAYS", 30)),
            "exportLabel": "Export JSON",
            "deleteLabel": "Delete history",
        },
        "monitorStatus": status,
    }


def build_dashboard_payload() -> dict:
    df = _load_metrics_dataframe()

    payload: dict[str, Any] = {}

    overview = build_overview_section(df)
    if overview:
        payload["overview"] = overview

    idle = build_idle_section(df)
    if idle:
        payload["idle"] = idle

    apps = build_apps_section(df)
    if apps:
        payload["apps"] = apps

    switches = build_switches_section(df)
    if switches:
        payload["switches"] = switches

    timeline = build_timeline_section(df)
    if timeline:
        payload["timeline"] = timeline

    focus = build_focus_section(df)
    if focus:
        payload["focus"] = focus

    payload["settings"] = build_settings_section()

    return payload
