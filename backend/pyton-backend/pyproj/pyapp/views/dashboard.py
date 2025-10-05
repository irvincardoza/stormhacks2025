from __future__ import annotations

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET

from ..services.dashboard_data import build_dashboard_payload


@require_GET
def dashboard_summary(request):
    payload = build_dashboard_payload()
    return JsonResponse(
        {
            "data": payload,
            "generated_at": timezone.now().isoformat(),
        }
    )

