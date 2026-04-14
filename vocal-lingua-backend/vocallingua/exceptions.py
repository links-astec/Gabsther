"""
Gabsther — API Exception Handler
Custom error responses with better debugging info
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler that logs errors and returns user-friendly messages.
    """
    # Log the error for debugging
    logger.error(
        f'API Error: {exc.__class__.__name__}',
        exc_info=True,
        extra={
            'path': context.get('request').path if context.get('request') else None,
            'method': context.get('request').method if context.get('request') else None,
        }
    )

    # Call default handler
    response = exception_handler(exc, context)

    # If response is None, framework couldn't handle it
    if response is None:
        return Response(
            {'detail': 'An unexpected error occurred. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Ensure all error responses have a 'detail' key
    if 'detail' not in response.data and isinstance(response.data, dict):
        if response.status_code >= 500:
            response.data = {'detail': 'A server error occurred. Our team has been notified.'}
        else:
            response.data = {'detail': str(response.data)}

    return response
