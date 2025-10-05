from pathlib import Path
from django.conf import settings

BASE_DIR: Path = settings.BASE_DIR  # .../pyton-backend/pyproj

# Where uploads go (keep inside project, change if you want)
SCREENSHOT_DIR: Path = BASE_DIR / "pyproj" / "screenshots"

# Write history OUTSIDE the project: ../.. / data-backend / q_analysis.jsonl
HISTORY_FILE: Path = BASE_DIR.parent.parent / "data-backend" / "q_analysis.jsonl"

# Ensure folders exist
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
