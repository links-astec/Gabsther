"""
Gabsther — Root URL Configuration
All API routes live under /api/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # API v1 routes (namespaced)
    path('api/auth/', include('apps.users.urls.auth_urls')),
    path('api/users/', include('apps.users.urls.user_urls')),
    path('api/lessons/', include('apps.lessons.urls')),
    path('api/voice/', include('apps.voice.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Admin panel branding
admin.site.site_header = 'Gabsther Admin'
admin.site.site_title = 'Gabsther'
admin.site.index_title = 'Manage Gabsther'
