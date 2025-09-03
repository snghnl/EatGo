from django.contrib.auth import get_user_model

from .models import Route
from .serializers import (
    RouteSerializer,
    RouteRecommendationInputSerializer,
    RouteRecommendationOutputSerializer,
)
from rest_framework.generics import ListAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .service import RouteRecommendationService
from .selectors import user_preferences_get
from rest_framework.viewsets import ModelViewSet


User = get_user_model()


class RouteMyListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)


class RouteViewSet(ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]


class RouteRecommendationView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RouteRecommendationInputSerializer

    def post(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(
                {"error": "Invalid input data", "details": input_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = input_serializer.validated_data
        places_data = request.data.get("places_data", [])

        if not places_data:
            return Response(
                {
                    "error": "No places_data provided. Include places_data in request body for route generation."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = RouteRecommendationService(
                user_lat=validated_data["lat"],
                user_lng=validated_data["lng"],
                max_distance_km=validated_data.get("max_distance_km", 20.0),
            )

            user_preferences = user_preferences_get(user=request.user)

            result = service.generate_optimized_route(
                places_data=places_data,
                user_preferences=user_preferences,
                max_places=validated_data.get("limit", 10),
            )

            output_serializer = RouteRecommendationOutputSerializer(data=result)

            if output_serializer.is_valid():
                return Response(
                    output_serializer.validated_data, status=status.HTTP_200_OK
                )
            else:
                return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to generate recommendations: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
