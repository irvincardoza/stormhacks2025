"""
Process activity.jsonl as the single source of truth for all dashboard metrics.
This module reads the raw activity log and computes accurate statistics.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Optional
from collections import defaultdict

from django.utils import timezone as dj_timezone

from .paths import ACTIVITY_FILE  # shared data directory path


def _parse_activity_line(line: str) -> Optional[dict]:
    """Parse a single JSONL line from activity.jsonl"""
    line = line.strip()
    if not line:
        return None
    try:
        data = json.loads(line)
        # Validate required fields
        if "timestamp" not in data or "app_name" not in data:
            return None
        return data
    except json.JSONDecodeError:
        return None


def _parse_iso_timestamp(ts_str: str) -> Optional[datetime]:
    """Parse ISO timestamp; treat naive strings as local time (no UTC shift)."""
    if not ts_str:
        return None
    try:
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            # If the source string has no zone, interpret it as local time
            local_tz = dj_timezone.get_current_timezone()
            dt = dj_timezone.make_aware(dt, local_tz)
        return dt
    except (ValueError, AttributeError, Exception):
        return None


def _format_hour_label(dt: datetime) -> str:
    """Format hour as 24-hour HH:MM using local time."""
    return dt.strftime("%H:%M")


def _classify_productivity(app_name: str, window_title: str) -> str:
    """
    Classify activity as productive/unproductive/neutral based on app and window.
    This is a simple heuristic - expand as needed.
    """
    app_lower = app_name.lower()
    window_lower = window_title.lower()
    
    # Productive apps/patterns
    productive_apps = {"cursor", "vs code", "terminal", "figma", "github"}
    productive_patterns = ["stormhacks", "code", "development", "programming"]
    
    # Unproductive apps/patterns
    unproductive_apps = {"spotify"}
    unproductive_patterns = ["youtube", "twitter", "facebook", "reddit", "qualifying highlights"]
    
    # Check productive
    if any(prod in app_lower for prod in productive_apps):
        return "productive"
    if any(pattern in window_lower for pattern in productive_patterns):
        return "productive"
    
    # Check unproductive
    if any(unprod in app_lower for unprod in unproductive_apps):
        return "unproductive"
    if any(pattern in window_lower for pattern in unproductive_patterns):
        return "unproductive"
    
    # Default to neutral
    return "neutral"


def load_activity_data() -> list[dict]:
    """
    Load and parse all activity from activity.jsonl.
    Returns list of enriched activity records with parsed timestamps.
    """
    if not ACTIVITY_FILE.exists():
        return []
    
    activities = []
    with open(ACTIVITY_FILE, "r", encoding="utf-8") as f:
        for line in f:
            data = _parse_activity_line(line)
            if not data:
                continue
            
            # Parse timestamp
            dt = _parse_iso_timestamp(data["timestamp"])
            if not dt:
                continue
            
            # Convert to local timezone (noop if already local)
            local_tz = dj_timezone.get_current_timezone()
            dt_local = dt.astimezone(local_tz)
            
            # Enrich the record
            record = {
                "timestamp": dt_local,
                "timestamp_iso": dt_local.isoformat(),
                "timestamp_raw": data.get("timestamp", ""),
                "timestamp_hour": dt_local.replace(minute=0, second=0, microsecond=0),
                "app_name": data.get("app_name", "Unknown"),
                "window_title": data.get("window_title", ""),
                "idle_seconds": float(data.get("idle_seconds", 0)),
            }
            
            # Calculate active time (assuming 5-second polling interval)
            poll_interval = 5.0
            active_seconds = max(0, poll_interval - min(record["idle_seconds"], poll_interval))
            record["active_seconds"] = active_seconds
            
            # Classify productivity
            record["productivity"] = _classify_productivity(
                record["app_name"], 
                record["window_title"]
            )
            
            activities.append(record)
    
    # Sort by timestamp
    activities.sort(key=lambda x: x["timestamp"])
    return activities


def compute_hourly_productivity(activities: list[dict]) -> list[dict]:
    """
    Compute hourly productive/unproductive percentages.
    Returns list of {hour, productive, unproductive} dicts.
    """
    if not activities:
        return []
    
    # Group by hour
    hourly_data = defaultdict(lambda: {"productive": 0.0, "unproductive": 0.0, "neutral": 0.0})
    
    for record in activities:
        hour = record["timestamp_hour"]
        active_secs = record["active_seconds"]
        productivity = record["productivity"]
        
        if productivity == "productive":
            hourly_data[hour]["productive"] += active_secs
        elif productivity == "unproductive":
            hourly_data[hour]["unproductive"] += active_secs
        else:
            hourly_data[hour]["neutral"] += active_secs
    
    # Convert to percentages
    result = []
    for hour in sorted(hourly_data.keys()):
        data = hourly_data[hour]
        total = data["productive"] + data["unproductive"] + data["neutral"]
        
        if total > 0:
            prod_pct = (data["productive"] / total) * 100
            unprod_pct = (data["unproductive"] / total) * 100
        else:
            prod_pct = 0.0
            unprod_pct = 0.0
        
        result.append({
            "hour": hour.isoformat(),
            "productive": round(prod_pct, 2),
            "unproductive": round(unprod_pct, 2),
        })
    
    return result


def compute_context_switches(activities: list[dict]) -> list[dict]:
    """
    Count context switches (app changes) per hour.
    Returns list of {hour, switches} dicts.
    """
    if not activities:
        return []
    
    hourly_switches = defaultdict(int)
    prev_app = None
    
    for record in activities:
        current_app = record["app_name"]
        
        # Count a switch if app changed
        if prev_app is not None and prev_app != current_app:
            hour = record["timestamp_hour"]
            hourly_switches[hour] += 1
        
        prev_app = current_app
    
    result = []
    for hour in sorted(hourly_switches.keys()):
        result.append({
            "hour": hour.isoformat(),
            "switches": hourly_switches[hour],
        })
    
    return result


def compute_productivity_summary(activities: list[dict]) -> dict:
    """
    Compute overall productivity summary in minutes.
    Returns {productive, unproductive, idle, total_minutes}.
    """
    if not activities:
        return {
            "productive": 0.0,
            "unproductive": 0.0,
            "idle": 0.0,
            "neutral": 0.0,
            "total_minutes": 0.0,
        }
    
    totals = {"productive": 0.0, "unproductive": 0.0, "idle": 0.0, "neutral": 0.0}
    
    for record in activities:
        active_secs = record["active_seconds"]
        idle_secs = record["idle_seconds"]
        productivity = record["productivity"]
        
        # Count active time by productivity
        if productivity == "productive":
            totals["productive"] += active_secs
        elif productivity == "unproductive":
            totals["unproductive"] += active_secs
        else:
            totals["neutral"] += active_secs
        
        # Count idle time (time user was away)
        totals["idle"] += idle_secs
    
    # Convert to minutes
    result = {
        "productive": round(totals["productive"] / 60, 2),
        "unproductive": round(totals["unproductive"] / 60, 2),
        "idle": round(totals["idle"] / 60, 2),
        "neutral": round(totals["neutral"] / 60, 2),
    }
    
    result["total_minutes"] = sum(result.values())
    
    return result


def build_timeline_data(activities: list[dict]) -> dict:
    """
    Build timeline data for the frontend.
    Returns {dailyTimeline, activityEvents} formatted for the UI.
    """
    if not activities:
        return {
            "dailyTimeline": {"points": [], "config": {}},
            "activityEvents": [],
        }
    
    # Group by hour and app for stacked timeline
    hourly_by_app = defaultdict(lambda: defaultdict(float))
    
    for record in activities:
        hour = record["timestamp_hour"]
        app = record["app_name"]
        minutes = record["active_seconds"] / 60.0
        hourly_by_app[hour][app] += minutes
    
    # Get top 5 apps by total time
    app_totals = defaultdict(float)
    for hour_data in hourly_by_app.values():
        for app, minutes in hour_data.items():
            app_totals[app] += minutes
    
    top_apps = sorted(app_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    top_app_names = [app for app, _ in top_apps]
    
    # Build timeline points
    timeline_points = []
    for hour in sorted(hourly_by_app.keys()):
        point = {"name": _format_hour_label(hour)}
        
        hour_data = hourly_by_app[hour]
        others = 0.0
        
        for app, minutes in hour_data.items():
            if app in top_app_names:
                point[app] = round(minutes, 2)
            else:
                others += minutes
        
        if others > 0:
            point["Other"] = round(others, 2)
        
        timeline_points.append(point)
    
    # Build config for chart colors
    all_apps = set()
    for point in timeline_points:
        all_apps.update(k for k in point.keys() if k != "name")
    
    colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ]
    
    config = {}
    for i, app in enumerate(sorted(all_apps)):
        config[app] = {
            "label": app,
            "color": colors[i % len(colors)],
        }
    
    # Build activity events (last 200 for the feed)
    events = []
    for record in activities[-200:]:
        events.append({
            # Show the original timestamp string from the JSON source (no reformatting)
            "ts": record.get("timestamp_raw") or record["timestamp_iso"],
            "app": record["app_name"],
            "window": record["window_title"],
            "domain": None,  # Could extract from window_title if needed
            "idleSec": int(record["idle_seconds"]),
            "category": record["productivity"],
            "productivity": record["productivity"],
        })
    
    return {
        "dailyTimeline": {
            "points": timeline_points,
            "config": config,
        },
        "activityEvents": events,
    }


def build_overview_data(activities: list[dict]) -> dict:
    """
    Build overview section data for the dashboard.
    """
    summary = compute_productivity_summary(activities)
    hourly_prod = compute_hourly_productivity(activities)
    context_switches = compute_context_switches(activities)
    
    # Productivity breakdown donut
    slices = []
    colors = {
        "Productive": "hsl(var(--chart-1))",
        "Neutral": "hsl(var(--chart-3))",
        "Unproductive": "hsl(var(--chart-2))",
        "Idle": "hsl(var(--chart-4))",
    }
    
    for key, label in [("productive", "Productive"), ("neutral", "Neutral"), 
                        ("unproductive", "Unproductive"), ("idle", "Idle")]:
        value = summary.get(key, 0.0)
        if value > 0:
            slices.append({
                "name": label,
                "value": value,
                "color": colors[label],
            })
    
    breakdown_config = {s["name"]: {"label": s["name"], "color": s["color"]} for s in slices}
    
    # Hourly productivity chart
    hourly_points = []
    for item in hourly_prod:
        dt = _parse_iso_timestamp(item["hour"])
        if dt:
            hourly_points.append({
                "name": _format_hour_label(dt),
                "productive": item["productive"],
                "unproductive": item["unproductive"],
            })
    
    hourly_config = {
        "productive": {"label": "Productive", "color": "hsl(var(--chart-1))"},
        "unproductive": {"label": "Unproductive", "color": "hsl(var(--chart-2))"},
    }
    
    # Context switch trend
    context_points = []
    for item in context_switches:
        dt = _parse_iso_timestamp(item["hour"])
        if dt:
            context_points.append({
                "name": _format_hour_label(dt),
                "switches": item["switches"],
            })
    
    context_config = {
        "switches": {"label": "Switches", "color": "hsl(var(--chart-1))"},
    }
    
    return {
        "productivityBreakdown": {
            "slices": slices,
            "config": breakdown_config,
        },
        "hourlyProductivity": {
            "points": hourly_points,
            "config": hourly_config,
        },
        "contextSwitchTrend": {
            "points": context_points,
            "config": context_config,
        },
        "weeklyProductivity": {
            "points": [],  # Would need historical data
            "config": {},
        },
    }
