from django.urls import path
from .views import analyze_screenshot,get_history

urlpatterns = [
    path('analyze/', analyze_screenshot, name='analyze'),
    path("api/history/", get_history, name="history"),
]
