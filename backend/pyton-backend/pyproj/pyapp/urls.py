from django.urls import path
from .views.analyze import analyze_screenshot
from .views.history import get_history

urlpatterns = [
    path("analyze/", analyze_screenshot, name="analyze"),
    path("history/", get_history, name="history"),
]
