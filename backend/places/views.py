from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from .models import Place
from .serializers import (
    PlaceSerializer,
    PlaceRecommendInputSerializer,
    PlaceRecommendOutputSerializer,
)
from third_party_maps.kakao_service import KakaoMapService

# Create your views here.


class PlaceViewSet(ModelViewSet):
    serializer_class = PlaceSerializer
    queryset = Place.objects.all()


class PlaceRecommendView(APIView):
    kakao_service = KakaoMapService()

    def get(self, request, *args, **kwargs):
        serializer = PlaceRecommendInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        categories = validated_data.get("category_filter", [])
        categories = ",".join(categories)
        places = self.kakao_service.search_by_keyword(
            query=categories,
            x=validated_data["x"],
            y=validated_data["y"],
            radius=validated_data["radius"],
            page=validated_data["page"],
            size=validated_data["size"],
            sort=validated_data["sort"],
        )
        response_serializer = PlaceRecommendOutputSerializer({"places": places})

        return Response(response_serializer.data)
