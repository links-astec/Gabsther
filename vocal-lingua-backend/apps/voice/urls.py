"""
Voice endpoints — /api/voice/
"""

from django.urls import path
from .views import VoiceSessionListCreateView, VoiceSessionDetailView, ChatProxyView

urlpatterns = [
    path('sessions/', VoiceSessionListCreateView.as_view(), name='voice-session-list'),
    path('sessions/<int:pk>/', VoiceSessionDetailView.as_view(), name='voice-session-detail'),
    path('chat/', ChatProxyView.as_view(), name='voice-chat'),
]
