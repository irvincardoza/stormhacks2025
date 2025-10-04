import os
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from .models import VoiceRequest
from .elevenlabs_client import synthesize_text_to_file
import tempfile
import json

# STT placeholder - replace with Whisper/Cloud STT integration
def simple_stt_placeholder(audio_path: str) -> str:
    # Very primitive fallback for demo: return a canned transcript or read filename
    return f"[transcript placeholder for {os.path.basename(audio_path)}]"

# LLM routing placeholder
def llm_route_text(transcript: str, context: dict = None) -> str:
    """
    Default stub: returns a short polite reply.
    Replace this with actual LLM call (local or remote).
    """
    # If you have a real LLM endpoint, POST to LLM_RESPONDER_URL with payload.
    lrm = os.getenv("LLM_RESPONDER_URL")
    if lrm:
        try:
            import requests
            r = requests.post(lrm, json={"transcript": transcript, "context": context or {}})
            r.raise_for_status()
            return r.json().get("response", "").strip()
        except Exception:
            pass
    # Fallback canned reply:
    return f"You said: {transcript[:200]}. (This is a stub reply. Replace with real LLM.)"

@shared_task
def process_stt(voice_request_id: int):
    vr = VoiceRequest.objects.get(pk=voice_request_id)
    vr.status = 'uploaded'
    vr.save()
    try:
        local_path = vr.audio_file.path
        transcript = simple_stt_placeholder(local_path)
        vr.transcript_text = transcript
        vr.status = 'stt_done'
        vr.save()
        # Queue next task
        process_llm.delay(vr.id)
    except Exception as e:
        vr.status = 'error'
        vr.save()
        raise

@shared_task
def process_llm(voice_request_id: int):
    vr = VoiceRequest.objects.get(pk=voice_request_id)
    try:
        transcript = vr.transcript_text or ""
        # you can pass context info here; for hackathon use empty context
        llm_resp = llm_route_text(transcript, context={})
        vr.llm_response = llm_resp
        vr.status = 'llm_done'
        vr.save()
        # Generate TTS
        generate_tts.delay(vr.id)
    except Exception as e:
        vr.status = 'error'
        vr.save()
        raise

@shared_task
def generate_tts(voice_request_id: int):
    vr = VoiceRequest.objects.get(pk=voice_request_id)
    try:
        text = vr.llm_response or "I don't have an answer right now."
        out_file = synthesize_text_to_file(text, voice_id=os.getenv("ELEVENLABS_VOICE_ID","alloy"))
        # attach to model record (use Django FileField)
        from django.core.files import File
        with open(out_file, 'rb') as f:
            django_file = File(f)
            vr.tts_audio_file.save(os.path.basename(out_file), django_file, save=True)
        vr.status = 'tts_done'
        vr.save()
    except Exception as e:
        vr.status = 'error'
        vr.save()
        raise

# Cleanup job: delete expired voice requests
@shared_task
def cleanup_expired_voice_requests():
    expiry_cutoff = timezone.now()
    expired = VoiceRequest.objects.filter(expires_at__lte=expiry_cutoff)
    for v in expired:
        try:
            if v.audio_file:
                v.audio_file.delete(save=False)
            if v.tts_audio_file:
                v.tts_audio_file.delete(save=False)
            v.delete()
        except Exception:
            pass
