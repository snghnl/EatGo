from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "community"

router = DefaultRouter()
router.register(r"posts", views.PostViewSet, basename="posts")
router.register(r"comments", views.CommentViewSet, basename="comments")

urlpatterns = [
    path("api/community/", include(router.urls)),
]
