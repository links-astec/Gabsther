"""Gabsther — Voice Admin"""

from django.contrib import admin
from .models import VoiceSession


@admin.register(VoiceSession)
class VoiceSessionAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'language', 'lesson', 'scenario',
        'duration_seconds', 'messages_sent',
        'pronunciation_score', 'created_at',
    )
    list_filter = ('language', 'created_at')
    search_fields = ('user__email', 'scenario', 'summary')
    raw_id_fields = ('user', 'lesson', 'language')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
