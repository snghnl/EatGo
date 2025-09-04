"""
URL configuration for eatgo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from django.conf import settings
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)


# Export a top-level Info object for drf_yasg DEFAULT_INFO import string
api_info = openapi.Info(
    title="EatGo API",
    default_version="v1",
    description="EatGo API",
)

schema_view = get_schema_view(
    api_info,
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    # swagger
    path(
        "swagger.<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("admin/", admin.site.urls),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    # auth (JWT)
    path(
        settings.API_VERSION + "/auth/token",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        settings.API_VERSION + "/auth/token/refresh",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        settings.API_VERSION + "/auth/token/verify",
        TokenVerifyView.as_view(),
        name="token_verify",
    ),
    # api
    path(settings.API_VERSION + "/kakaomap/", include("kakaomap.urls")),
    path(settings.API_VERSION + "/accounts/", include("accounts.urls")),
    path(settings.API_VERSION + "/auth/", include("accounts.urls")),
    path(settings.API_VERSION + "/", include("core.urls")),
    path(settings.API_VERSION + "/routes/", include("routes.urls")),
    path(settings.API_VERSION + "/travel_courses/", include("travel_courses.urls")),
    path(settings.API_VERSION + "/tourism/", include("tourism.urls")),
    path(settings.API_VERSION + "/places/", include("places.urls")),
    # path('api-auth/', include('rest_framework.urls')),
]
