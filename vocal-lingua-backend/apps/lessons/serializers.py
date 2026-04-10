"""
Gabsther — Lesson Serializers
"""

from rest_framework import serializers
from .models import Language, Lesson, LessonProgress


class LanguageSerializer(serializers.ModelSerializer):
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Language
        fields = (
            'id', 'code', 'name', 'native_name', 'flag_emoji',
            'tts_locale', 'is_active', 'order', 'lesson_count',
        )

    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()


class LessonListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lesson list views."""
    language_name = serializers.CharField(source='language.name', read_only=True)
    language_flag = serializers.CharField(source='language.flag_emoji', read_only=True)
    language_code = serializers.CharField(source='language.code', read_only=True)
    is_completed = serializers.SerializerMethodField()
    user_score = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'subtitle', 'description', 'category',
            'difficulty', 'duration_minutes', 'xp_reward',
            'thumbnail_emoji', 'order', 'is_free', 'is_published',
            'language_name', 'language_flag', 'language_code',
            'is_completed', 'user_score',
        )

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.progress.filter(user=request.user, completed=True).exists()

    def get_user_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        progress = obj.progress.filter(user=request.user).first()
        return progress.score if progress else None


class LessonDetailSerializer(serializers.ModelSerializer):
    """Full serializer including content JSON for lesson detail view."""
    language = LanguageSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'subtitle', 'description', 'category',
            'difficulty', 'content', 'audio_script', 'scenario_prompt',
            'duration_minutes', 'xp_reward', 'thumbnail_emoji',
            'order', 'is_free', 'is_published',
            'language', 'is_completed', 'user_progress',
            'created_at', 'updated_at',
        )

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.progress.filter(user=request.user, completed=True).exists()

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        progress = obj.progress.filter(user=request.user).first()
        if not progress:
            return None
        return LessonProgressSerializer(progress).data


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_emoji = serializers.CharField(source='lesson.thumbnail_emoji', read_only=True)

    class Meta:
        model = LessonProgress
        fields = (
            'id', 'lesson', 'lesson_title', 'lesson_emoji',
            'completed', 'score', 'attempts', 'time_spent_seconds',
            'xp_earned', 'first_attempted_at', 'completed_at', 'last_practiced_at',
        )
        read_only_fields = ('id', 'first_attempted_at', 'completed_at', 'last_practiced_at')


class MarkCompleteSerializer(serializers.Serializer):
    """Payload for POST /lessons/{id}/complete/"""
    score = serializers.FloatField(min_value=0, max_value=100, default=100.0)
    time_spent_seconds = serializers.IntegerField(min_value=0, default=0)


class ProgressStatsSerializer(serializers.Serializer):
    """Aggregated stats for the profile/dashboard."""
    total_lessons = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    total_xp = serializers.IntegerField()
    average_score = serializers.FloatField()
    by_category = serializers.DictField()
    by_difficulty = serializers.DictField()
