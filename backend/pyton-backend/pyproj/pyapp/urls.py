from django.urls import path

from .views.analyze import analyze_screenshot
from .views.overlay_assist import overlay_assist_view
from .views.dashboard import dashboard_summary


urlpatterns = [
    path("analyze/", analyze_screenshot, name="analyze"),
    path("overlay-assist/", overlay_assist_view, name="overlay-assist"),
    path("dashboard/", dashboard_summary, name="dashboard"),
]
