from django.urls import path
from .views import (
    KakaoMapView,
    SearchPlacesView,
    CalculateDistanceView,
    RouteInfoView,
    OptimizeRouteView,
)

urlpatterns = [
    path("map/", KakaoMapView.as_view(), name="get_kakao_map"),
    path("search/", SearchPlacesView.as_view(), name="search_places_from_kakao"),
    path("distance/", CalculateDistanceView.as_view(), name="calculate_distance"),
    path("route/", RouteInfoView.as_view(), name="get_route_info"),
    path(
        "optimize-route/",
        OptimizeRouteView.as_view(),
        name="calculate_multi_point_distance",
    ),
]
