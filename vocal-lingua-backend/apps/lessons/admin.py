"""Gabsther — Lessons Admin"""

from django.contrib import admin
from .models import Language, Lesson, LessonProgress


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('flag_emoji', 'name', 'native_name', 'code', 'tts_locale', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    search_fields = ('name', 'code')


class LessonProgressInline(admin.TabularInline):
    model = LessonProgress
    extra = 0
    readonly_fields = ('user', 'completed', 'score', 'attempts', 'completed_at')
    can_delete = False


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        'thumbnail_emoji', 'title', 'language', 'category',
        'difficulty', 'order', 'duration_minutes', 'xp_reward',
        'is_published', 'is_free',
    )
    list_filter = ('language', 'category', 'difficulty', 'is_published', 'is_free')
    list_editable = ('order', 'is_published', 'is_free')
    search_fields = ('title', 'description')
    ordering = ('language', 'order')
    inlines = [LessonProgressInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('language', 'title', 'subtitle', 'description',
                       'category', 'difficulty', 'thumbnail_emoji'),
        }),
        ('Content', {
            'fields': ('content', 'audio_script', 'scenario_prompt'),
            'classes': ('collapse',),
        }),
        ('Settings', {
            'fields': ('order', 'duration_minutes', 'xp_reward', 'is_published', 'is_free'),
        }),
    )


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'completed', 'score', 'attempts', 'xp_earned', 'completed_at')
    list_filter = ('completed', 'lesson__language', 'lesson__category')
    search_fields = ('user__email', 'lesson__title')
    raw_id_fields = ('user', 'lesson')
