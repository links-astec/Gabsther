"""
Gabsther — User Serializers
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile, Streak

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# AUTH SERIALIZERS
# ─────────────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """User registration — creates User + UserProfile in one step."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'password_confirm',
                  'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # Auto-create profile
        UserProfile.objects.get_or_create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends the default JWT payload with user info."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info alongside tokens
        user = self.user  # type: ignore[attr-defined]
        data['user'] = {  # type: ignore[index]
            'id': user.pk,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        return data


# ─────────────────────────────────────────────────────────────────────────────
# PROFILE SERIALIZERS
# ─────────────────────────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    """Full profile for /api/users/me/"""
    current_language_code = serializers.CharField(
        source='current_language.code', read_only=True
    )
    current_language_name = serializers.CharField(
        source='current_language.name', read_only=True
    )
    current_language_flag = serializers.CharField(
        source='current_language.flag_emoji', read_only=True
    )

    class Meta:
        model = UserProfile
        fields = (
            'id',
            'level',
            'interests',
            'total_xp',
            'lessons_completed',
            'total_speaking_minutes',
            'avatar_url',
            'bio',
            'daily_goal_minutes',
            'current_language',           # FK id (writable)
            'current_language_code',      # read-only
            'current_language_name',      # read-only
            'current_language_flag',      # read-only
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'total_xp', 'lessons_completed', 'total_speaking_minutes',
            'created_at', 'updated_at',
        )


class UserSerializer(serializers.ModelSerializer):
    """User with nested profile."""
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'date_joined', 'last_login', 'profile'
        )
        read_only_fields = ('email', 'date_joined', 'last_login')


# ─────────────────────────────────────────────────────────────────────────────
# STREAK SERIALIZERS
# ─────────────────────────────────────────────────────────────────────────────

class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = ('id', 'date', 'current_streak', 'longest_streak', 'activity_type')
        read_only_fields = ('id', 'date', 'current_streak', 'longest_streak')


class StreakSummarySerializer(serializers.Serializer):
    """Summary data for the dashboard streak widget."""
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    last_activity_date = serializers.DateField(allow_null=True)
    activity_dates = serializers.ListField(child=serializers.DateField())
