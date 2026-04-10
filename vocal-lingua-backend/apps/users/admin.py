"""Gabsther — User Admin"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Streak


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'level', 'current_language', 'total_xp', 'lessons_completed')
    list_filter = ('level', 'current_language')
    search_fields = ('user__email', 'user__username')
    raw_id_fields = ('user', 'current_language')


@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'current_streak', 'longest_streak', 'activity_type')
    list_filter = ('activity_type',)
    search_fields = ('user__email',)
    ordering = ('-date',)
    date_hierarchy = 'date'
