from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RouteMyListView, RouteRecommendationView, RouteViewSet

router = DefaultRouter()
router.register(r"", RouteViewSet, basename="route")

urlpatterns = [
    path("recommend/", RouteRecommendationView.as_view(), name="route-recommend"),
    path("my/", RouteMyListView.as_view(), name="my"),
    path("", include(router.urls)),
]
