from django.db import models
from django.conf import settings

class VoiceRequest(models.Model):
    STATUS_CHOICES = [
        ('uploaded','uploaded'),
        ('stt_done','stt_done'),
        ('llm_done','llm_done'),
        ('tts_done','tts_done'),
        ('error','error'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    audio_file = models.FileField(upload_to='voice/audio/%Y/%m/%d/')
    transcript_text = models.TextField(null=True, blank=True)
    llm_response = models.TextField(null=True, blank=True)
    tts_audio_file = models.FileField(upload_to='voice/tts/%Y/%m/%d/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

class TriggerRule(models.Model):
    TYPE_CHOICES = [('idle','idle'),('unproductive_app','unproductive_app'),('custom','custom')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    condition_json = models.JSONField(default=dict)  # e.g. {"idle_minutes": 10}
    action_json = models.JSONField(default=dict)     # e.g. {"action": "voice_nudge", "template": "Are you there?"}
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class VoiceEvent(models.Model):
    rule = models.ForeignKey(TriggerRule, on_delete=models.CASCADE)
    fired_at = models.DateTimeField(auto_now_add=True)
    payload = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)
