from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import VoiceRequest, TriggerRule, VoiceEvent
from .serializers import VoiceRequestSerializer, TriggerRuleSerializer, VoiceEventSerializer
from .tasks import process_stt
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ingest_voice(request):
    """
    Accepts multipart form data with 'audio_file'. Creates VoiceRequest and queues STT.
    """
    audio = request.FILES.get('audio_file')
    if not audio:
        return Response({"detail":"audio_file required"}, status=status.HTTP_400_BAD_REQUEST)
    vr = VoiceRequest.objects.create(user=request.user, audio_file=audio)
    # set expiration default in X days
    retention_days = int(getattr(settings, "VOICE_RETENTION_DAYS", 7))
    vr.expires_at = timezone.now() + timedelta(days=retention_days)
    vr.save()
    # enqueue STT processing
    process_stt.delay(vr.id)
    return Response({"id": vr.id, "status": vr.status})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_request_status(request, pk):
    vr = get_object_or_404(VoiceRequest, pk=pk, user=request.user)
    serializer = VoiceRequestSerializer(vr)
    return Response(serializer.data)

# Trigger CRUD (basic)
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def triggers_list_create(request):
    if request.method == 'GET':
        qs = TriggerRule.objects.filter(user=request.user)
        serializer = TriggerRuleSerializer(qs, many=True)
        return Response(serializer.data)
    else:
        serializer = TriggerRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT','DELETE'])
@permission_classes([IsAuthenticated])
def trigger_update_delete(request, pk):
    tr = get_object_or_404(TriggerRule, pk=pk, user=request.user)
    if request.method == 'PUT':
        serializer = TriggerRuleSerializer(tr, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        tr.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
