from rest_framework.routers import DefaultRouter
from .views import TravelCourseViewSet

router = DefaultRouter()
router.register('', TravelCourseViewSet, basename='travelcourse')

urlpatterns = router.urls 