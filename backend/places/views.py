from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Place, MenuItem
from .serializers import PlaceSerializer, MenuItemSerializer

# Create your views here.


class PlaceListAPIView(ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer


class PlaceRetrieveAPIView(RetrieveAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer


class MenuItemListAPIView(ListAPIView):
    def get_queryset(self):
        # During schema generation, kwargs may not include route params
        if getattr(self, "swagger_fake_view", False):
            return MenuItem.objects.none()

        place_pk = self.kwargs.get("pk")
        if not place_pk:
            return MenuItem.objects.none()

        return MenuItem.objects.filter(place_id=place_pk)

    serializer_class = MenuItemSerializer
