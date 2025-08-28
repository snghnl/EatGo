from django.contrib.auth import get_user_model
import uuid

from .models import Route
from .serializers import RouteSerializer, RouteRecommendationInputSerializer
from rest_framework.generics import ListAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .recommendation_service import RouteRecommendationService
from accounts.models import UserPreference
from core.models import Category
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

    def get_user_preferences(self, user, custom_preferences=None):
        """
        Get user preferences either from database or custom input.
        Returns a dictionary mapping category names to preference scores.
        """
        preferences = {}

        if custom_preferences:
            # Use custom preferences provided in request
            for pref in custom_preferences:
                try:
                    category = Category.objects.get(id=pref["category_id"])
                    preferences[category.name] = pref["preference_score"]
                except Category.DoesNotExist:
                    continue
        else:
            # Use stored user preferences from database
            user_prefs = UserPreference.objects.filter(user=user).select_related(
                "category"
            )
            for user_pref in user_prefs:
                preferences[user_pref.category.name] = user_pref.preference_score

        return preferences

    def post(self, request, *args, **kwargs):
        # Validate input data using serializer
        input_serializer = self.get_serializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(
                {"error": "Invalid input data", "details": input_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = input_serializer.validated_data
        user = request.user

        # Extract validated data
        user_lat = validated_data["lat"]
        user_lng = validated_data["lng"]
        max_distance_km = validated_data.get("max_distance_km", 20.0)
        limit = validated_data.get("limit", 20)
        category_filter = validated_data.get("category_filter")
        custom_preferences = validated_data.get("preferences")
        use_stored_preferences = validated_data.get("use_stored_preferences", True)

        # Get user preferences
        user_preferences = None
        if use_stored_preferences or custom_preferences:
            user_preferences = self.get_user_preferences(
                user=user,
                custom_preferences=custom_preferences
                if not use_stored_preferences
                else None,
            )

        # Initialize recommendation service
        service = RouteRecommendationService(
            user_lat=user_lat, user_lng=user_lng, max_distance_km=max_distance_km
        )

        try:
            recommendation = service.generate_route_recommendation(
                user=user,
                max_places=limit,
                category_filter=category_filter,
                user_preferences=user_preferences,  # Pass preferences to service
            )

            # Transform recommendation into a list of route-like items
            places = []
            for p in recommendation.get("places", []):
                place = p["place"]
                places.append(
                    {
                        "id": str(place.id),
                        "name": place.name,
                        "primary_category": p.get("primary_category"),
                    }
                )

            routes_list = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "추천 경로",
                    "description": "",
                    "places": places,
                }
            ]

            return Response(routes_list)

        except Exception as e:
            return Response(
                {"error": f"Failed to generate recommendations: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
