"""
Gabsther — User Views
─────────────────────────
Auth: register, login (JWT), logout, token refresh
User: me, update profile, onboarding
Streak: current streak, heatmap data, record activity
"""

from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserProfile, Streak
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserProfileSerializer,
    StreakSerializer,
    StreakSummarySerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# AUTH VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create account and return JWT tokens."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue tokens immediately after registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — returns access + refresh JWT tokens."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# USER / PROFILE VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class MeView(APIView):
    """GET /api/users/me/ — return full user + profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        """Update top-level user fields (first_name, last_name)."""
        allowed_fields = {'first_name', 'last_name', 'username'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = UserSerializer(request.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProfileView(APIView):
    """GET/PATCH /api/users/profile/ — manage UserProfile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(
            profile, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class OnboardingView(APIView):
    """
    POST /api/users/onboarding/
    Sets language, level, and interests in one call (used after registration).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        data = {}

        if 'language_id' in request.data:
            data['current_language'] = request.data['language_id']
        if 'level' in request.data:
            data['level'] = request.data['level']
        if 'interests' in request.data:
            data['interests'] = request.data['interests']

        serializer = UserProfileSerializer(
            profile, data=data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
# STREAK VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class StreakView(APIView):
    """
    GET  /api/users/streak/ — current streak summary
    POST /api/users/streak/ — record today's activity (updates streak)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        streaks = Streak.objects.filter(user=request.user).order_by('-date')
        latest = streaks.first()

        # Calculate current streak — it's only "active" if last activity was today or yesterday
        current_streak = 0
        if latest:
            days_since = (today - latest.date).days
            if days_since <= 1:
                current_streak = latest.current_streak
            # else streak is broken

        longest_streak = latest.longest_streak if latest else 0

        # Activity dates for heatmap (last 365 days)
        one_year_ago = today - timezone.timedelta(days=365)
        activity_dates = list(
            streaks.filter(date__gte=one_year_ago).values_list('date', flat=True)
        )

        data = {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'last_activity_date': latest.date if latest else None,
            'activity_dates': activity_dates,
        }
        serializer = StreakSummarySerializer(data)
        return Response(serializer.data)

    def post(self, request):
        """Record a learning activity — updates streak for today."""
        activity_type = request.data.get('activity_type', 'lesson')
        streak = Streak.record_activity(request.user, activity_type=activity_type)
        serializer = StreakSerializer(streak)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HeatmapView(APIView):
    """GET /api/users/heatmap/ — activity data for the contribution-style heatmap."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Default: last 12 months
        months = int(request.query_params.get('months', 12))
        today = timezone.now().date()
        start = today - timezone.timedelta(days=months * 30)

        streaks = Streak.objects.filter(
            user=request.user,
            date__gte=start,
        ).values('date', 'current_streak', 'activity_type')

        return Response({
            'start_date': start,
            'end_date': today,
            'data': list(streaks),
        })
