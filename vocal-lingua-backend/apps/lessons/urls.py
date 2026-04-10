"""
Lesson endpoints — /api/lessons/
"""

from django.urls import path
from .views import (
    LanguageListView,
    LessonListView,
    LessonDetailView,
    MarkLessonCompleteView,
    UserProgressListView,
    ProgressStatsView,
)

urlpatterns = [
    # Languages
    path('languages/', LanguageListView.as_view(), name='language-list'),

    # Lessons
    path('', LessonListView.as_view(), name='lesson-list'),
    path('<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('<int:pk>/complete/', MarkLessonCompleteView.as_view(), name='lesson-complete'),

    # Progress
    path('progress/', UserProgressListView.as_view(), name='lesson-progress-list'),
    path('stats/', ProgressStatsView.as_view(), name='lesson-stats'),
]
