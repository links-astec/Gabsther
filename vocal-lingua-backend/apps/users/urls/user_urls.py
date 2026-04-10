"""
User endpoints — /api/users/
"""

from django.urls import path
from apps.users.views import (
    MeView,
    ProfileView,
    OnboardingView,
    StreakView,
    HeatmapView,
)

urlpatterns = [
    path('me/', MeView.as_view(), name='user-me'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('onboarding/', OnboardingView.as_view(), name='user-onboarding'),
    path('streak/', StreakView.as_view(), name='user-streak'),
    path('heatmap/', HeatmapView.as_view(), name='user-heatmap'),
]
