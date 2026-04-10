"""
Gabsther — Voice / Chat Views
──────────────────────────────────
- VoiceSessionListCreateView: save / list sessions
- ChatProxyView: proxy text to Groq, return reply + corrections
"""

import json
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VoiceSession
from .serializers import (
    VoiceSessionSerializer,
    CreateVoiceSessionSerializer,
    ChatMessageSerializer,
)
from apps.users.models import Streak


# ─────────────────────────────────────────────────────────────────────────────
# SESSION CRUD
# ─────────────────────────────────────────────────────────────────────────────

class VoiceSessionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/voice/sessions/ — list user's past sessions
    POST /api/voice/sessions/ — save a completed session
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateVoiceSessionSerializer
        return VoiceSessionSerializer

    def get_queryset(self):
        return VoiceSession.objects.filter(
            user=self.request.user
        ).select_related('lesson', 'language')[:50]

    def perform_create(self, serializer):
        session = serializer.save(user=self.request.user)
        # Record streak for voice activity
        Streak.record_activity(self.request.user, activity_type='voice')
        # Credit speaking time to profile
        if hasattr(self.request.user, 'profile'):
            minutes = session.duration_seconds // 60
            self.request.user.profile.total_speaking_minutes += minutes
            self.request.user.profile.save(update_fields=['total_speaking_minutes'])


class VoiceSessionDetailView(generics.RetrieveAPIView):
    """GET /api/voice/sessions/{id}/ — single session detail."""
    serializer_class = VoiceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VoiceSession.objects.filter(user=self.request.user)


# ─────────────────────────────────────────────────────────────────────────────
# OPENAI PROXY
# ─────────────────────────────────────────────────────────────────────────────

class ChatProxyView(APIView):
    """
    POST /api/voice/chat/
    Proxies the user's spoken text to OpenAI GPT and returns:
    - reply: the AI's French response
    - corrections: [{original, corrected, explanation}]
    - english_translation: optional translation of the reply

    If OPENAI_API_KEY is not set, returns a mock response for dev.
    """
    permission_classes = [permissions.IsAuthenticated]

    # Base system prompt — personalised per language/scenario
    SYSTEM_PROMPT_TEMPLATE = """You are a friendly and encouraging French language tutor named Sophie.
You are helping a student practice conversational French.

Language: {language}
Scenario: {scenario}
Student level: {level}

Rules:
1. Always respond primarily in French, keeping it natural and at the student's level.
2. After your French response, provide an English translation in parentheses.
3. If the student made any French errors, gently correct them at the end of your reply in this exact JSON format:
   CORRECTIONS: [{{"original": "...", "corrected": "...", "explanation": "..."}}]
4. Be warm, encouraging, and conversational.
5. Keep responses concise (2-4 sentences) to simulate natural conversation.
6. If no corrections are needed, omit the CORRECTIONS line entirely."""

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if not settings.GROQ_API_KEY:
            return self._mock_response(data['message'])

        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)

            # Build user level
            level = 'A1'
            if hasattr(request.user, 'profile') and request.user.profile:
                level = request.user.profile.level

            system_prompt = self.SYSTEM_PROMPT_TEMPLATE.format(
                language='French' if data['language_code'] == 'fr' else data['language_code'],
                scenario=data['scenario'] or 'General French conversation',
                level=level,
            )

            # Build message history
            messages = [{'role': 'system', 'content': system_prompt}]
            for msg in data['history'][-10:]:
                messages.append({
                    'role': msg.get('role', 'user'),
                    'content': msg.get('content', ''),
                })
            messages.append({'role': 'user', 'content': data['message']})

            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                max_tokens=500,
                temperature=0.7,
            )

            reply_text = response.choices[0].message.content
            return self._parse_response(reply_text)

        except Exception as e:
            import traceback
            traceback.print_exc()
            error_str = str(e).lower()
            if any(k in error_str for k in ('auth', 'api key', 'invalid', 'permission', '401', '403')):
                return self._mock_response(data['message'])
            return Response(
                {'detail': f'AI service error: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    def _parse_response(self, text: str) -> Response:
        """Extract corrections JSON from the AI reply."""
        corrections = []
        clean_reply = text

        if 'CORRECTIONS:' in text:
            parts = text.split('CORRECTIONS:', 1)
            clean_reply = parts[0].strip()
            try:
                corrections_raw = parts[1].strip()
                # Find the JSON array
                start = corrections_raw.find('[')
                end = corrections_raw.rfind(']') + 1
                if start != -1 and end > start:
                    corrections = json.loads(corrections_raw[start:end])
            except (json.JSONDecodeError, ValueError):
                corrections = []

        return Response({
            'reply': clean_reply,
            'corrections': corrections,
        })

    def _mock_response(self, user_message: str) -> Response:
        """Dev fallback when no OpenAI key is configured."""
        return Response({
            'reply': (
                "Bonjour ! C'est super que vous pratiquez votre français. "
                "(Hello! It's great that you're practicing your French.) "
                "Continuez comme ça ! (Keep it up!)"
            ),
            'corrections': [],
            '_mock': True,
        })
