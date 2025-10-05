# pyapp/views/analyze.py (only the relevant bits shown)
import re, os
from datetime import datetime
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import sys, subprocess
from pathlib import Path
import sys, subprocess
from pathlib import Path
from ..utils.gemini_api import analyze_image
from ..services.paths import BASE_DIR, SCREENSHOT_DIR, HISTORY_FILE
from ..services.history_store import append_history

def _sanitize_filename(name: str) -> str:
    import os, re
    base, ext = os.path.splitext(name)
    safe_base = re.sub(r"[^A-Za-z0-9._-]+", "_", base).strip("._-") or "upload"
    safe_ext = re.sub(r"[^A-Za-z0-9.]+", "", ext)[:10] or ".png"
    return f"{safe_base}{safe_ext}"

def _rel_or_abs(p: Path, base: Path) -> str:
    try:
        return p.relative_to(base).as_posix()
    except ValueError:
        return str(p)

@csrf_exempt
def analyze_screenshot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Use POST"}, status=405)

    upload = request.FILES.get("screenshot")
    if not upload:
        return JsonResponse({"error": "No screenshot provided"}, status=400)

    prompt = request.POST.get(
        "prompt",
        "Return JSON with keys app_name, window_title, productive (true/false).",
    )

    # Save file
    safe_name = _sanitize_filename(upload.name)
    abs_path: Path = SCREENSHOT_DIR / safe_name
    with abs_path.open("wb") as out:
        for chunk in upload.chunks():
            out.write(chunk)

    # Analyze with Gemini -> dict with app_name, window_title, productive
    result = analyze_image(str(abs_path), prompt)

    # Local timestamp to seconds
    ts = timezone.localtime(timezone.now()).replace(microsecond=0).isoformat(timespec="seconds")

    # Minimal entry you want to persist
    entry = {
        "timestamp": ts,
        "app_name": result.get("app_name", "unknown"),
        "window_title": result.get("window_title", "unknown"),
        "productive": result.get("productive", None),
    }

    # Append ONLY; no reads
    append_history(entry)

    # Return a simple acknowledgment
    return JsonResponse({
        "saved_to": _rel_or_abs(HISTORY_FILE, BASE_DIR),
        "file_path_rel": abs_path.relative_to(BASE_DIR).as_posix(),
        "filename": safe_name,
        "entry": entry
    })
