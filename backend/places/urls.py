from django.urls import path
from .views import PlaceListAPIView, PlaceRetrieveAPIView, MenuItemListAPIView


urlpatterns = [
    path("", PlaceListAPIView.as_view(), name="place-list"),
    path("<uuid:pk>/", PlaceRetrieveAPIView.as_view(), name="place-detail"),
    path("<uuid:pk>/menu-items/", MenuItemListAPIView.as_view(), name="menu-item-list"),
]
