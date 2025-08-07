from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# ViewSet 라우터 설정
router = DefaultRouter()
router.register(r"pois", views.TourismPOIViewSet, basename="tourism-poi")
router.register(r"related", views.RelatedTourismViewSet, basename="related-tourism")
router.register(
    r"recommendation",
    views.TourismRecommendationViewSet,
    basename="tourism-recommendation",
)
router.register(r"api", views.TourismAPIViewSet, basename="tourism-api")

app_name = "tourism"

urlpatterns = [
    # ViewSet 기반 URL
    path("", include(router.urls)),
]
