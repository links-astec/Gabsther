"""
Gabsther — Voice / Chat Models
───────────────────────────────────
VoiceSession: stores conversation transcripts, AI corrections,
and pronunciation feedback from speaking practice sessions.
"""

from django.db import models


class VoiceSession(models.Model):
    """
    One speaking practice session.

    transcript: list of message objects
        [{"role": "user"|"assistant", "text": "...", "timestamp": "ISO8601"}]

    corrections: list of correction objects
        [{"original": "...", "corrected": "...", "explanation": "..."}]
    """
    user = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='voice_sessions'
    )
    lesson = models.ForeignKey(
        'lessons.Lesson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='voice_sessions',
    )
    language = models.ForeignKey(
        'lessons.Language',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    # Conversation data
    transcript = models.JSONField(
        default=list,
        help_text='List of {role, text, timestamp} message objects',
    )
    summary = models.TextField(
        blank=True,
        help_text='AI-generated summary of what was practiced',
    )
    corrections = models.JSONField(
        default=list,
        help_text='List of {original, corrected, explanation} objects',
    )

    # Scores / metrics
    pronunciation_score = models.FloatField(
        null=True, blank=True, help_text='Overall pronunciation score 0–100'
    )
    fluency_score = models.FloatField(
        null=True, blank=True, help_text='Fluency score 0–100'
    )
    messages_sent = models.PositiveIntegerField(default=0)

    # Session context
    scenario = models.CharField(
        max_length=300,
        blank=True,
        help_text="e.g. 'Ordering food at a Parisian café'",
    )
    duration_seconds = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        ts = self.created_at.strftime('%Y-%m-%d %H:%M')
        return f"{self.user.email} — {ts} ({self.duration_seconds}s)"
