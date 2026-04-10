"""
Gabsther — User Models
─────────────────────────
- User: extends AbstractUser, uses email as username
- UserProfile: language level, interests, current language
- Streak: daily activity tracking for gamification
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom user model using email as the primary login identifier.
    Extend this freely — add social auth, avatar, etc.
    """
    email = models.EmailField(unique=True)
    # Override username to be non-unique (email is the unique identifier)
    username = models.CharField(max_length=150, unique=False, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Required for createsuperuser

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # Auto-fill username from email if not set
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    """
    Extended profile data separate from auth concerns.
    One-to-one with User, auto-created on user registration.
    """
    LEVEL_CHOICES = [
        ('A1', 'A1 — Beginner'),
        ('A2', 'A2 — Elementary'),
        ('B1', 'B1 — Intermediate'),
        ('B2', 'B2 — Upper Intermediate'),
        ('C1', 'C1 — Advanced'),
        ('C2', 'C2 — Mastery'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile'
    )
    # Learning settings
    current_language = models.ForeignKey(
        'lessons.Language',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='learners',
    )
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES, default='A1')
    # interests stored as JSON list, e.g. ["travel", "food", "business"]
    interests = models.JSONField(default=list, blank=True)

    # Gamification
    total_xp = models.PositiveIntegerField(default=0)
    lessons_completed = models.PositiveIntegerField(default=0)
    total_speaking_minutes = models.PositiveIntegerField(default=0)

    # Cosmetics
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True, max_length=500)

    # Daily goal (minutes per day)
    daily_goal_minutes = models.PositiveIntegerField(default=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} [{self.level}]"


class Streak(models.Model):
    """
    Tracks daily activity streaks.
    One record per user per day — upsert pattern.

    current_streak: consecutive days ending today
    longest_streak: all-time best
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='streaks')
    date = models.DateField()                              # The activity date
    current_streak = models.PositiveIntegerField(default=1)
    longest_streak = models.PositiveIntegerField(default=1)
    activity_type = models.CharField(
        max_length=50,
        default='lesson',
        help_text="Type: 'lesson', 'voice', 'review'",
    )

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.user.email} — {self.date} (streak: {self.current_streak})"

    @classmethod
    def record_activity(cls, user, activity_type='lesson'):
        """
        Call this when a user completes any learning activity.
        Creates today's streak record and calculates the current streak.
        Returns the Streak instance.
        """
        today = timezone.now().date()
        yesterday = today - timezone.timedelta(days=1)

        # Check if there was activity yesterday
        try:
            yesterday_streak = cls.objects.get(user=user, date=yesterday)
            new_current = yesterday_streak.current_streak + 1
            new_longest = max(yesterday_streak.longest_streak, new_current)
        except cls.DoesNotExist:
            # No activity yesterday — streak resets to 1
            # But check if there's already a streak from before
            last_streak = cls.objects.filter(user=user).first()
            new_current = 1
            new_longest = last_streak.longest_streak if last_streak else 1

        streak, _ = cls.objects.update_or_create(
            user=user,
            date=today,
            defaults={
                'current_streak': new_current,
                'longest_streak': new_longest,
                'activity_type': activity_type,
            },
        )
        return streak
