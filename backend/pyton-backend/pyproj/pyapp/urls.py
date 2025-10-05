from django.urls import path

from .views.analyze import analyze_screenshot
from .views.dashboard import dashboard_summary


urlpatterns = [
    path("analyze/", analyze_screenshot, name="analyze"),
    path("dashboard/", dashboard_summary, name="dashboard"),
]
