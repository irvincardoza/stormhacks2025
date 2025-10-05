from pathlib import Path

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from ..services.paths import SCREENSHOT_DIR
from ..utils.gemini_api import overlay_assist
from .analyze import _sanitize_filename


OVERLAY_DIR = SCREENSHOT_DIR / "overlay"
OVERLAY_DIR.mkdir(parents=True, exist_ok=True)


@csrf_exempt
def overlay_assist_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Use POST"}, status=405)

    upload = request.FILES.get("screenshot")
    if not upload:
        return JsonResponse({"error": "No screenshot provided"}, status=400)

    prompt = request.POST.get("prompt", "")

    safe_name = _sanitize_filename(upload.name or "overlay.png")
    abs_path: Path = OVERLAY_DIR / safe_name

    with abs_path.open("wb") as out:
        for chunk in upload.chunks():
            out.write(chunk)

    try:
        reply = overlay_assist(str(abs_path), prompt)
    except Exception as exc:
        return JsonResponse({"error": f"Overlay assist failed: {exc}"}, status=500)

    return JsonResponse({
        "reply": reply,
        "model": "gemini-2.5-flash",
    })

