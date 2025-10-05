from pathlib import Path

from django.conf import settings


BASE_DIR: Path = settings.BASE_DIR  # .../pyton-backend/pyproj

# Shared data directory is located at .../backend/data-backend (three levels up from settings.BASE_DIR)
# BASE_DIR = .../backend/pyton-backend/pyproj
# BASE_DIR.parent = .../backend/pyton-backend
# BASE_DIR.parent.parent = .../backend
# BASE_DIR.parent.parent.parent = .../ (repo root)
# We need .../backend/data-backend
DATA_DIR: Path = BASE_DIR.parent.parent / "data-backend"

# If running from a different working tree (packaged app), fall back to repo-level path
if not DATA_DIR.exists():
    alt = BASE_DIR.parent.parent.parent / "data-backend"
    if alt.exists():
        DATA_DIR = alt

# Where uploads go (keep inside project, change if you want)
SCREENSHOT_DIR: Path = BASE_DIR / "pyproj" / "screenshots"

# Logs and derived analytics
HISTORY_FILE: Path = DATA_DIR / "q_analysis.jsonl"
ACTIVITY_FILE: Path = DATA_DIR / "activity.jsonl"
METRICS_FILE: Path = DATA_DIR / "metrics.jsonl"
CONTEXT_SWITCHES_FILE: Path = DATA_DIR / "context_switches.json"
HOURLY_FILE: Path = DATA_DIR / "hourly_productivity.json"
SUMMARY_FILE: Path = DATA_DIR / "productivity_summary.json"
MONITOR_FILE: Path = DATA_DIR / "monitor_status.json"


# Ensure folders exist
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
