from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TravelCourseViewSet, MyTravelCourseListAPIView

router = DefaultRouter()
router.register("", TravelCourseViewSet, basename="travelcourse")

urlpatterns = [
    path("my/", MyTravelCourseListAPIView.as_view(), name="my-travel-courses"),
    path("", include(router.urls)),
]
