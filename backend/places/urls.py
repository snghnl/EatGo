from django.urls import path
from .views import PlaceViewSet, PlaceRecommendView


urlpatterns = [
    path(
        "", PlaceViewSet.as_view({"get": "list", "post": "create"}), name="place-list"
    ),
    path(
        "<uuid:pk>/",
        PlaceViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="place-detail",
    ),
    path("recommend/", PlaceRecommendView.as_view(), name="place-recommend"),
]
