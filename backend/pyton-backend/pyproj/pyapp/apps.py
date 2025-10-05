import atexit
import os

from django.apps import AppConfig
from django.conf import settings


class PyappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pyapp"

    def ready(self) -> None:  # noqa: D401
        """Start background tasks once when the Django app is ready."""

        if not getattr(settings, "TRACKLET_ENABLE_BACKGROUND", True):
            return

        is_main_process = os.environ.get("RUN_MAIN") == "true" or not settings.DEBUG
        if not is_main_process:
            return

        from .services.background_tasks import start_background_tasks, stop_background_tasks

        start_background_tasks()
        atexit.register(stop_background_tasks)
