"""
Gabsther — Health Check View
Simple endpoint for uptime monitoring
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    GET /health/
    Returns 200 if the backend is running and database is accessible.
    Used by UptimeRobot and other monitoring services.
    """
    return Response({
        'status': 'ok',
        'service': 'Gabsther API',
        'timestamp': request.timestamp if hasattr(request, 'timestamp') else None,
    })
