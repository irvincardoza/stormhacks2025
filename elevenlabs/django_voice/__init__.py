# ensure Celery app auto-discovers tasks
default_app_config = 'django_voice.apps.VoiceConfig' if False else None