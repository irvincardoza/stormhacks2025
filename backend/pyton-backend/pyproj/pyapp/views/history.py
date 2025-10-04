from django.http import JsonResponse
from ..services.history_store import read_history

def get_history(request):
    """
    GET /api/history/?limit=20
    Returns array of {timestamp, analysis}
    """
    items = read_history()
    limit = request.GET.get("limit")
    if limit and limit.isdigit():
        items = items[-int(limit):]
    return JsonResponse(items, safe=False)
