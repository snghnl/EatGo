from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RouteViewSet, user_preferences, categories_list


router = DefaultRouter()
router.register(r"", RouteViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("preferences/", user_preferences, name="user_preferences"),
    path("categories/", categories_list, name="categories_list"),
]
