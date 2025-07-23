from django.urls import path
from .views import get_kakao_map, search_places_from_kakao

urlpatterns = [
    path('map/', get_kakao_map, name='get_kakao_map'),
    path('search/', search_places_from_kakao, name='search_places_from_kakao'),
] 