from django.urls import path
from . import views

urlpatterns = [
    path('ingest/', views.ingest_voice, name='voice-ingest'),
    path('requests/<int:pk>/', views.get_request_status, name='voice-status'),
    path('triggers/', views.triggers_list_create, name='triggers-list-create'),
    path('triggers/<int:pk>/', views.trigger_update_delete, name='triggers-update-delete'),
]
