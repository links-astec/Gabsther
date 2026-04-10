"""
Gabsther — Lesson Models
────────────────────────────
- Language: supported languages (French, Spanish, German, etc.)
- Lesson: individual learning units with rich content JSON
- LessonProgress: per-user completion tracking
"""

from django.db import models
from django.utils import timezone


class Language(models.Model):
    """
    Supported languages.
    Adding a new language = one new row here + seed lessons.
    """
    code = models.CharField(max_length=10, unique=True)   # ISO 639-1, e.g. 'fr'
    name = models.CharField(max_length=100)                # English name, e.g. 'French'
    native_name = models.CharField(max_length=100)         # e.g. 'Français'
    flag_emoji = models.CharField(max_length=10, default='🌐')
    tts_locale = models.CharField(
        max_length=20,
        default='fr-FR',
        help_text="BCP-47 locale for SpeechSynthesis API, e.g. 'fr-FR'",
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.flag_emoji} {self.name} ({self.code})"


class Lesson(models.Model):
    """
    A single lesson unit.

    content JSON structure:
    {
        "vocabulary": [{"word": "bonjour", "translation": "hello", "example": "..."}],
        "phrases": [{"french": "...", "english": "...", "audio_hint": "..."}],
        "grammar_notes": "...",
        "speaking_prompts": ["...", "..."],
        "quiz": [{"question": "...", "options": [...], "answer": 0}]
    }
    """
    CATEGORY_CHOICES = [
        ('greetings', 'Greetings & Introductions'),
        ('food_drink', 'Food & Drink'),
        ('travel', 'Travel'),
        ('grammar', 'Grammar Basics'),
        ('roleplay', 'Role-play Scenarios'),
        ('culture', 'Culture & Customs'),
        ('business', 'Business French'),
        ('numbers', 'Numbers & Time'),
        ('family', 'Family & Relationships'),
        ('shopping', 'Shopping'),
        ('health', 'Health & Body'),
        ('nature', 'Nature & Weather'),
    ]

    DIFFICULTY_CHOICES = [
        ('A1', 'A1 — Beginner'),
        ('A2', 'A2 — Elementary'),
        ('B1', 'B1 — Intermediate'),
        ('B2', 'B2 — Upper Intermediate'),
        ('C1', 'C1 — Advanced'),
        ('C2', 'C2 — Mastery'),
    ]

    language = models.ForeignKey(
        Language, on_delete=models.CASCADE, related_name='lessons'
    )
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(
        max_length=2, choices=DIFFICULTY_CHOICES, default='A1'
    )

    # Rich structured content (vocabulary, phrases, quiz, etc.)
    content = models.JSONField(default=dict)

    # Plain text script for TTS pronunciation guides
    audio_script = models.TextField(
        blank=True,
        help_text="Script used for TTS practice — key phrases to speak aloud.",
    )

    # AI scenario prompt for the voice chat feature
    scenario_prompt = models.TextField(
        blank=True,
        help_text="System prompt used when the user practices this lesson via voice chat.",
    )

    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=10)
    xp_reward = models.PositiveIntegerField(default=10)
    thumbnail_emoji = models.CharField(max_length=10, default='📚')
    is_published = models.BooleanField(default=True)
    is_free = models.BooleanField(default=True, help_text="Free preview lesson")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['language', 'order']
        indexes = [
            models.Index(fields=['language', 'category', 'difficulty']),
        ]

    def __str__(self):
        return f"[{self.language.code.upper()}][{self.difficulty}] {self.title}"


class LessonProgress(models.Model):
    """
    Tracks a single user's progress on a single lesson.
    Created on first attempt, updated on subsequent attempts.
    """
    user = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='lesson_progress'
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name='progress'
    )

    completed = models.BooleanField(default=False)
    score = models.FloatField(default=0.0, help_text="Score 0–100")
    attempts = models.PositiveIntegerField(default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)

    # Timestamps
    first_attempted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_practiced_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')
        ordering = ['-last_practiced_at']

    def __str__(self):
        status = '✓' if self.completed else '○'
        return f"{status} {self.user.email} — {self.lesson.title}"

    def mark_complete(self, score: float = 100.0, time_spent: int = 0):
        """Mark lesson as completed and award XP."""
        self.completed = True
        self.score = max(self.score, score)
        self.attempts += 1
        self.time_spent_seconds += time_spent
        self.completed_at = timezone.now()
        if self.xp_earned == 0:
            self.xp_earned = self.lesson.xp_reward
            # Credit XP to user profile
            self.user.profile.total_xp += self.lesson.xp_reward
            self.user.profile.lessons_completed += 1
            self.user.profile.save(update_fields=['total_xp', 'lessons_completed'])
        self.save()
