import re, os, json
from datetime import datetime
from pathlib import Path
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ..utils.gemini_api import analyze_image
from ..services.paths import BASE_DIR, SCREENSHOT_DIR, HISTORY_FILE
from ..services.history_store import append_history


def _sanitize_filename(name: str) -> str:
    """Make filename filesystem-safe"""
    base, ext = os.path.splitext(name)
    safe_base = re.sub(r"[^A-Za-z0-9._-]+", "_", base).strip("._-") or "upload"
    safe_ext = re.sub(r"[^A-Za-z0-9.]+", "", ext)[:10] or ".png"
    return f"{safe_base}{safe_ext}"



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

    # Save file (unchanged)
    safe_name = _sanitize_filename(upload.name)
    abs_path: Path = SCREENSHOT_DIR / safe_name
    with abs_path.open("wb") as out:
        for chunk in upload.chunks():
            out.write(chunk)

    # Analyze → dict with desired keys
    result = analyze_image(str(abs_path), prompt)
    timestamp = timezone.localtime(timezone.now()).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%S")


    # ✅ EXACT schema you requested
    entry = {
        "timestamp": timestamp,
        "app_name": result.get("app_name", "unknown"),
        "window_title": result.get("window_title", "unknown"),
        "productive": result.get("productive", None),
    }

    append_history(entry)

    return JsonResponse({
        "saved_to": HISTORY_FILE.relative_to(BASE_DIR).as_posix(),
        "file_path_rel": abs_path.relative_to(BASE_DIR).as_posix(),
        "filename": safe_name,
        "entry": entry
    })