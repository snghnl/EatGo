from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema

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

    @swagger_auto_schema(
        query_serializer=PlaceRecommendInputSerializer,
        responses={200: PlaceRecommendOutputSerializer},
    )
    def get(self, request, *args, **kwargs):
        serializer = PlaceRecommendInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        categories = validated_data.get("category_filter", [])
        categories = ",".join(categories)
        response = self.kakao_service.search_by_keyword(
            query=categories,
            x=validated_data["lng"],
            y=validated_data["lat"],
            radius=validated_data["max_distance_km"] * 1000,
            size=validated_data["limit"],
        )

        places = response.get("documents", [])

        response_serializer = PlaceRecommendOutputSerializer({"places": places})

        return Response(response_serializer.data)
