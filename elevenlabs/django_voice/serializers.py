from rest_framework import serializers
from .models import VoiceRequest, TriggerRule, VoiceEvent

class VoiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceRequest
        fields = '__all__'

class TriggerRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriggerRule
        fields = '__all__'

class VoiceEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceEvent
        fields = '__all__'
