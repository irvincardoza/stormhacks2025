from pathlib import Path
from django.conf import settings

BASE_DIR: Path = settings.BASE_DIR
SCREENSHOT_DIR: Path = BASE_DIR / "pyproj" / "screenshots"
HISTORY_DIR: Path = BASE_DIR / "pyproj" / "gem_res_data"
HISTORY_FILE: Path = HISTORY_DIR / "1_analysis.jsonl"  # jsonl so we can append

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_DIR.mkdir(parents=True, exist_ok=True)
