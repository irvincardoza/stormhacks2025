# pyapp/services/uploader.py
import os
import re
from pathlib import Path
from .paths import SCREENSHOT_DIR

def sanitize_filename(name: str) -> str:
    base, ext = os.path.splitext(name)
    safe_base = re.sub(r"[^A-Za-z0-9._-]+", "_", base).strip("._-") or "upload"
    safe_ext = re.sub(r"[^A-Za-z0-9.]+", "", ext)[:10]  # keep only valid chars
    return f"{safe_base}{safe_ext or '.png'}"

def save_upload(django_file) -> Path:
    safe_name = sanitize_filename(django_file.name)
    abs_path: Path = SCREENSHOT_DIR / safe_name
    with abs_path.open("wb") as out:
        for chunk in django_file.chunks():
            out.write(chunk)
    return abs_path, safe_name
