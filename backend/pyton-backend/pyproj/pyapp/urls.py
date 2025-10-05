from django.urls import path
from .views.analyze import analyze_screenshot


urlpatterns = [
    path("analyze/", analyze_screenshot, name="analyze"),
    
]
