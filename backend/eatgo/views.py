from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def get_csrf_token(request):
    """CSRF 토큰을 반환하는 뷰"""
    return JsonResponse({"csrfToken": get_token(request)})
