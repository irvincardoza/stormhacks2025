import json
import uuid
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .utils.gemini_api import analyze_image

# ---- Hostable, project-root–relative paths (no user-specific absolute paths) ----
BASE_DIR: Path = settings.BASE_DIR
SCREENSHOT_DIR: Path = BASE_DIR / "pyproj" / "screenshots"
HISTORY_DIR: Path = BASE_DIR / "pyproj" / "gem_res_data"
HISTORY_FILE: Path = HISTORY_DIR / "1_analysis.json"

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_DIR.mkdir(parents=True, exist_ok=True)

def _load_history():
    if not HISTORY_FILE.exists():
        return []
    try:
        return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

def _save_history(items):
    HISTORY_FILE.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")

def _sanitize_filename(name: str) -> str:
    # Simple safe filename (keeps extension)
    import re, os
    base, ext = os.path.splitext(name)
    safe_base = re.sub(r"[^A-Za-z0-9._-]+", "_", base).strip("._-") or "upload"
    safe_ext = re.sub(r"[^A-Za-z0-9.]+", "", ext)[:10]  # keep short, only valid chars
    return f"{safe_base}{safe_ext or '.png'}"
@csrf_exempt
def analyze_screenshot(request):
    """
    POST /api/analyze/
      - form-data: screenshot=@/path/to/file.png
      - optional:  prompt="instruction"
    """
    if request.method != "POST":
        return JsonResponse({"error": "Use POST"}, status=405)

    upload = request.FILES.get("screenshot")
    if not upload:
        return JsonResponse({"error": "No screenshot provided"}, status=400)

    prompt = request.POST.get("prompt", "Classify this screenshot by activity type")

    # Save upload using a hostable, relative path
    safe_name = _sanitize_filename(upload.name)
    abs_path: Path = SCREENSHOT_DIR / safe_name
    with abs_path.open("wb") as out:
        for chunk in upload.chunks():
            out.write(chunk)

    # Analyze with Gemini
    result_text = analyze_image(str(abs_path), prompt)

    # ✅ Only store timestamp + analysis in history JSON
    entry = {
        "timestamp": datetime.now().isoformat(),
        "analysis": result_text,
    }

    history = _load_history()            # expects/returns a list
    history.append(entry)                # append minimal entry
    _save_history(history)               # writes back the array

    # You can still return richer data to the client if you want:
    rel_path = abs_path.relative_to(BASE_DIR).as_posix()
    return JsonResponse({
        "saved_to": HISTORY_FILE.relative_to(BASE_DIR).as_posix(),
        "file_path_rel": rel_path,
        "filename": safe_name,
        "entry": entry
    })


def get_history(request):
    """
    GET /api/history/?limit=20
    Returns array of entries; paths are project-relative.
    """
    items = _load_history()
    limit = request.GET.get("limit")
    if limit and limit.isdigit():
        items = items[-int(limit):]
    return JsonResponse(items, safe=False)
