from django.urls import path
from .views import DistrictViewSet, ProvinceViewSet


urlpatterns = [
    path("districts/", DistrictViewSet.as_view({"get": "list"}), name="district-list"),
    path(
        "districts/<uuid:pk>/",
        DistrictViewSet.as_view({"get": "retrieve"}),
        name="district-detail",
    ),
    path("provinces/", ProvinceViewSet.as_view({"get": "list"}), name="province-list"),
    path(
        "provinces/<uuid:pk>/",
        ProvinceViewSet.as_view({"get": "retrieve"}),
        name="province-detail",
    ),
]
