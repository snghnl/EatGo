from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Place, MenuItem
from .serializers import PlaceSerializer, MenuItemSerializer

# Create your views here.


class PlaceListAPIView(ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer


class PlaceRetrieveAPIView(RetrieveAPIView):
    def get_queryset(self):
        return Place.objects.filter(id=self.kwargs["pk"])

    serializer_class = PlaceSerializer


class MenuItemListAPIView(ListAPIView):
    def get_queryset(self):
        return MenuItem.objects.filter(place_id=self.kwargs["pk"])

    serializer_class = MenuItemSerializer
