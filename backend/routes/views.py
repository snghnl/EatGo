from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Route
from .serializers import RouteSerializer
from .recommendation_service import RouteRecommendationService
from accounts.models import UserPreference
from core.models import Category

User = get_user_model()


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)

    @action(detail=False, methods=["post"])
    def recommend(self, request):
        """
        Generate route recommendations based on user preferences and location.

        Expected JSON payload:
        {
            "user_lat": 37.5665,
            "user_lng": 126.9780,
            "max_places": 5,
            "max_distance_km": 20.0,
            "category_filter": ["카페", "한식"] // optional
        }
        """
        try:
            data = request.data

            # Validate required parameters
            user_lat = float(data.get("user_lat"))
            user_lng = float(data.get("user_lng"))
            max_places = int(data.get("max_places", 5))
            max_distance_km = float(data.get("max_distance_km", 20.0))
            category_filter = data.get("category_filter", None)

        except (TypeError, ValueError, KeyError) as e:
            return Response(
                {"error": f"Invalid parameters: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Initialize recommendation service
        service = RouteRecommendationService(
            user_lat=user_lat, user_lng=user_lng, max_distance_km=max_distance_km
        )

        # Generate recommendations
        try:
            recommendation = service.generate_route_recommendation(
                user=request.user,
                max_places=max_places,
                category_filter=category_filter,
            )

            # Serialize the response
            serialized_places = []
            for place_info in recommendation["places"]:
                place = place_info["place"]
                serialized_places.append(
                    {
                        "id": str(place.id),
                        "name": place.name,
                        "lat": place.lat,
                        "lng": place.lng,
                        "address": place.address,
                        "road_address": place.road_address,
                        "phone_number": place.phone_number,
                        "avg_rating": place.avg_rating,
                        "place_type": place.place_type,
                        "score": place_info["score"],
                        "distance_km": place_info["distance_km"],
                        "primary_category": place_info["primary_category"],
                    }
                )

            response_data = {
                "places": serialized_places,
                "total_distance_km": recommendation["total_distance_km"],
                "estimated_duration_hours": recommendation["estimated_duration_hours"],
                "average_score": recommendation["average_score"],
                "user_location": recommendation["user_location"],
                "metadata": {
                    "max_places_requested": max_places,
                    "max_distance_km": max_distance_km,
                    "category_filter": category_filter,
                    "places_found": len(serialized_places),
                },
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to generate recommendations: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def user_preferences(request):
    """
    GET: Retrieve user's category preferences
    POST: Set/update user's category preferences

    POST JSON payload:
    {
        "preferences": {
            "카페": 0.8,
            "한식": 0.9,
            "이탈리안": 0.6
        }
    }
    """
    user = request.user

    if request.method == "GET":
        # Get current preferences
        preferences = UserPreference.objects.filter(user=user).select_related(
            "category"
        )

        preference_data = {}
        for pref in preferences:
            preference_data[pref.category.name] = pref.preference_score

        # Also return available categories
        categories = Category.objects.filter(is_active=True).values(
            "id", "name", "description"
        )

        return Response(
            {"preferences": preference_data, "available_categories": list(categories)}
        )

    elif request.method == "POST":
        try:
            data = request.data
            preferences_data = data.get("preferences", {})

            if not preferences_data:
                return Response(
                    {"error": "preferences field is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate and update preferences
            with transaction.atomic():
                updated_count = 0
                created_count = 0

                for category_name, score in preferences_data.items():
                    # Validate score
                    try:
                        score = float(score)
                        if not (0.0 <= score <= 1.0):
                            return Response(
                                {
                                    "error": f"Score for {category_name} must be between 0.0 and 1.0"
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                    except (TypeError, ValueError):
                        return Response(
                            {"error": f"Invalid score for {category_name}"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    # Find category
                    try:
                        category = Category.objects.get(
                            name=category_name, is_active=True
                        )
                    except Category.DoesNotExist:
                        return Response(
                            {"error": f"Category {category_name} not found"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    # Update or create preference
                    preference, created = UserPreference.objects.update_or_create(
                        user=user,
                        category=category,
                        defaults={"preference_score": score},
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

            return Response(
                {
                    "message": "Preferences updated successfully",
                    "created": created_count,
                    "updated": updated_count,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to update preferences: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def categories_list(request):
    """
    Get list of all available categories.
    """
    categories = Category.objects.filter(is_active=True).values(
        "id", "name", "description", "icon", "color", "category_type"
    )

    return Response({"categories": list(categories)})
