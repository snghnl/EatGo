from django.urls import path
from .views import (
    get_kakao_map,
    search_places_from_kakao,
    calculate_distance,
    get_route_info_from_kakao,
    calculate_multi_point_distance,
)

urlpatterns = [
    path("map/", get_kakao_map, name="get_kakao_map"),
    path("search/", search_places_from_kakao, name="search_places_from_kakao"),
    path("distance/", calculate_distance, name="calculate_distance"),
    path("route/", get_route_info_from_kakao, name="get_route_info"),
    path(
        "optimize-route/",
        calculate_multi_point_distance,
        name="calculate_multi_point_distance",
    ),
]
