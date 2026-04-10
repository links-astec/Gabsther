"""
Gabsther — Voice Session Serializers
"""

from rest_framework import serializers
from .models import VoiceSession


class VoiceSessionSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True, default=None)
    language_code = serializers.CharField(source='language.code', read_only=True, default=None)

    class Meta:
        model = VoiceSession
        fields = (
            'id', 'lesson', 'lesson_title', 'language', 'language_code',
            'transcript', 'summary', 'corrections',
            'pronunciation_score', 'fluency_score', 'messages_sent',
            'scenario', 'duration_seconds', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class CreateVoiceSessionSerializer(serializers.ModelSerializer):
    """Used when saving a completed voice session."""
    class Meta:
        model = VoiceSession
        fields = (
            'lesson', 'language',
            'transcript', 'summary', 'corrections',
            'pronunciation_score', 'fluency_score', 'messages_sent',
            'scenario', 'duration_seconds',
        )


class ChatMessageSerializer(serializers.Serializer):
    """
    Payload for POST /api/voice/chat/
    Proxies text to OpenAI and returns AI response + corrections.
    """
    message = serializers.CharField(max_length=2000)
    language_code = serializers.CharField(max_length=10, default='fr')
    scenario = serializers.CharField(max_length=300, default='', allow_blank=True)
    history = serializers.ListField(
        child=serializers.DictField(),
        default=list,
        help_text='Previous messages [{role, content}]',
    )
    lesson_id = serializers.IntegerField(required=False, allow_null=True)
