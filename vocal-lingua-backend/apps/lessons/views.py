"""
Gabsther — Lesson Views
───────────────────────────
Languages, Lessons (list/detail/filter), LessonProgress, Stats
"""

from django.db.models import Avg, Count, Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from django_filters import rest_framework as filters

from .models import Language, Lesson, LessonProgress
from .serializers import (
    LanguageSerializer,
    LessonListSerializer,
    LessonDetailSerializer,
    LessonProgressSerializer,
    MarkCompleteSerializer,
    ProgressStatsSerializer,
)
from apps.users.models import Streak


# ─────────────────────────────────────────────────────────────────────────────
# FILTERS
# ─────────────────────────────────────────────────────────────────────────────

class LessonFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='category')
    difficulty = filters.CharFilter(field_name='difficulty')
    language = filters.CharFilter(field_name='language__code')
    is_free = filters.BooleanFilter(field_name='is_free')

    class Meta:
        model = Lesson
        fields = ['category', 'difficulty', 'language', 'is_free']


# ─────────────────────────────────────────────────────────────────────────────
# LANGUAGE VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class LanguageListView(generics.ListAPIView):
    """GET /api/lessons/languages/ — list all active languages."""
    queryset = Language.objects.filter(is_active=True)
    serializer_class = LanguageSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


# ─────────────────────────────────────────────────────────────────────────────
# LESSON VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class LessonListView(generics.ListAPIView):
    """
    GET /api/lessons/
    Supports filtering: ?language=fr&category=greetings&difficulty=A1
    """
    serializer_class = LessonListSerializer
    filterset_class = LessonFilter
    search_fields = ['title', 'description', 'subtitle']
    ordering_fields = ['order', 'difficulty', 'xp_reward', 'duration_minutes']
    ordering = ['order']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):  # type: ignore[override]
        return Lesson.objects.filter(is_published=True).select_related('language')


class LessonDetailView(generics.RetrieveAPIView):
    """GET /api/lessons/{id}/ — full lesson including content JSON."""
    serializer_class = LessonDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):  # type: ignore[override]
        return Lesson.objects.filter(is_published=True).select_related('language')


class MarkLessonCompleteView(APIView):
    """
    POST /api/lessons/{id}/complete/
    Body: {"score": 85.5, "time_spent_seconds": 420}
    Marks lesson done, updates streak, awards XP.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk, is_published=True)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MarkCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vdata: dict = serializer.validated_data  # type: ignore[assignment]

        progress, _ = LessonProgress.objects.get_or_create(
            user=request.user, lesson=lesson
        )
        progress.mark_complete(
            score=vdata['score'],
            time_spent=vdata['time_spent_seconds'],
        )

        # Record streak activity
        Streak.record_activity(request.user, activity_type='lesson')

        return Response(LessonProgressSerializer(progress).data)


# ─────────────────────────────────────────────────────────────────────────────
# PROGRESS VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class UserProgressListView(generics.ListAPIView):
    """GET /api/lessons/progress/ — all progress records for the logged-in user."""
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        return LessonProgress.objects.filter(
            user=self.request.user
        ).select_related('lesson', 'lesson__language')


class ProgressStatsView(APIView):
    """
    GET /api/lessons/stats/
    Returns aggregated learning stats for the profile page.
    Optional: ?language=fr
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        language_code = request.query_params.get('language')
        qs = LessonProgress.objects.filter(user=request.user)

        if language_code:
            qs = qs.filter(lesson__language__code=language_code)

        total_lessons = qs.count()
        completed = qs.filter(completed=True)
        completed_count = completed.count()
        avg_score = completed.aggregate(avg=Avg('score'))['avg'] or 0.0

        # Breakdown by category
        by_category = {}
        for cat, label in Lesson.CATEGORY_CHOICES:
            cat_total = qs.filter(lesson__category=cat).count()
            cat_done = qs.filter(lesson__category=cat, completed=True).count()
            if cat_total > 0:
                by_category[cat] = {
                    'label': label,
                    'total': cat_total,
                    'completed': cat_done,
                }

        # Breakdown by difficulty
        by_difficulty = {}
        for diff, label in Lesson.DIFFICULTY_CHOICES:
            d_total = qs.filter(lesson__difficulty=diff).count()
            d_done = qs.filter(lesson__difficulty=diff, completed=True).count()
            if d_total > 0:
                by_difficulty[diff] = {
                    'label': label,
                    'total': d_total,
                    'completed': d_done,
                }

        data = {
            'total_lessons': total_lessons,
            'completed_lessons': completed_count,
            'completion_rate': (completed_count / total_lessons * 100) if total_lessons else 0.0,
            'total_xp': request.user.profile.total_xp if hasattr(request.user, 'profile') else 0,
            'average_score': round(avg_score, 1),
            'by_category': by_category,
            'by_difficulty': by_difficulty,
        }
        return Response(data)
