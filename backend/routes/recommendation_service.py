"""
Route recommendation service based on user preferences and distance optimization.
"""

from typing import List, Dict, Tuple, Optional
from django.contrib.auth import get_user_model

from places.models import Place, PlaceCategory
from accounts.models import UserPreference
from kakaomap.views import calculate_distance_haversine

User = get_user_model()


class RouteRecommendationService:
    """
    Service class for generating route recommendations based on user preferences and location.
    """

    def __init__(self, user_lat: float, user_lng: float, max_distance_km: float = 20.0):
        """
        Initialize the recommendation service.

        Args:
            user_lat: User's current latitude
            user_lng: User's current longitude
            max_distance_km: Maximum distance to consider for recommendations (default: 20km)
        """
        self.user_lat = user_lat
        self.user_lng = user_lng
        self.max_distance_km = max_distance_km

    def get_user_preferences(self, user: User) -> Dict[str, float]:
        """
        Get user's category preferences as a dictionary.

        Args:
            user: User instance

        Returns:
            Dictionary mapping category names to preference scores (0.0-1.0)
        """
        preferences = UserPreference.objects.filter(user=user).select_related(
            "category"
        )

        preference_dict = {}
        for pref in preferences:
            preference_dict[pref.category.name] = pref.preference_score

        return preference_dict

    def calculate_place_score(
        self, place: Place, user_preferences: Dict[str, float]
    ) -> float:
        """
        Calculate a composite score for a place based on user preferences, distance, and rating.

        Args:
            place: Place instance
            user_preferences: Dictionary of user category preferences

        Returns:
            Composite score (0.0-1.0)
        """
        # Distance component (closer = higher score)
        distance = calculate_distance_haversine(
            self.user_lat, self.user_lng, place.lat, place.lng
        )

        if distance > self.max_distance_km:
            return 0.0  # Too far away

        # Distance score: 1.0 at 0km, decreasing to 0.0 at max_distance_km
        distance_score = max(0.0, 1.0 - (distance / self.max_distance_km))

        # Preference component
        place_categories = PlaceCategory.objects.filter(place=place).select_related(
            "category"
        )

        preference_score = 0.0
        total_weight = 0.0

        for place_cat in place_categories:
            category_name = place_cat.category.name
            if category_name in user_preferences:
                weight = (
                    1.0 if place_cat.is_primary else 0.5
                )  # Primary categories weighted more
                preference_score += user_preferences[category_name] * weight
                total_weight += weight

        if total_weight > 0:
            preference_score = preference_score / total_weight
        else:
            preference_score = 0.5  # Default if no matching categories

        # Rating component (normalize 0-5 rating to 0-1 scale)
        rating_score = (place.avg_rating or 3.0) / 5.0  # Default to 3.0 if no rating

        # Composite score: weighted average
        composite_score = (
            preference_score * 0.5  # 50% preference
            + distance_score * 0.3  # 30% distance
            + rating_score * 0.2  # 20% rating
        )

        return min(1.0, max(0.0, composite_score))

    def get_recommended_places(
        self, user: User, limit: int = 20, category_filter: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Get recommended places for a user sorted by composite score.

        Args:
            user: User instance
            limit: Maximum number of places to return
            category_filter: Optional list of category names to filter by

        Returns:
            List of dictionaries containing place info and scores
        """
        user_preferences = self.get_user_preferences(user)

        if not user_preferences:
            # If user has no preferences, return popular places nearby
            return self._get_popular_places_nearby(limit)

        # Get places within distance range
        places_query = Place.objects.select_related().prefetch_related(
            "place_categories__category"
        )

        # Apply category filter if provided
        if category_filter:
            places_query = places_query.filter(
                place_categories__category__name__in=category_filter
            ).distinct()

        places = list(places_query)

        # Calculate scores and filter by distance
        recommended_places = []

        for place in places:
            score = self.calculate_place_score(place, user_preferences)

            if score > 0.1:  # Only include places with reasonable scores
                distance = calculate_distance_haversine(
                    self.user_lat, self.user_lng, place.lat, place.lng
                )

                recommended_places.append(
                    {
                        "place": place,
                        "score": score,
                        "distance_km": round(distance, 2),
                        "primary_category": self._get_primary_category(place),
                    }
                )

        # Sort by score (descending) and return top results
        recommended_places.sort(key=lambda x: x["score"], reverse=True)
        return recommended_places[:limit]

    def optimize_route_order(self, places: List[Dict]) -> Tuple[List[Dict], float]:
        """
        Optimize the order of places to minimize total travel distance.
        Uses a simple nearest neighbor algorithm.

        Args:
            places: List of place dictionaries from get_recommended_places

        Returns:
            Tuple of (optimized_places_list, total_distance_km)
        """
        if len(places) <= 1:
            return places, 0.0

        # Start from user's location
        current_lat, current_lng = self.user_lat, self.user_lng
        unvisited = places.copy()
        optimized_route = []
        total_distance = 0.0

        while unvisited:
            # Find nearest unvisited place
            min_distance = float("inf")
            nearest_place = None
            nearest_index = -1

            for i, place_info in enumerate(unvisited):
                place = place_info["place"]
                distance = calculate_distance_haversine(
                    current_lat, current_lng, place.lat, place.lng
                )

                if distance < min_distance:
                    min_distance = distance
                    nearest_place = place_info
                    nearest_index = i

            # Move to nearest place
            if nearest_place:
                optimized_route.append(nearest_place)
                unvisited.pop(nearest_index)
                total_distance += min_distance
                current_lat = nearest_place["place"].lat
                current_lng = nearest_place["place"].lng

        return optimized_route, round(total_distance, 2)

    def generate_route_recommendation(
        self,
        user: User,
        max_places: int = 5,
        category_filter: Optional[List[str]] = None,
    ) -> Dict:
        """
        Generate a complete route recommendation for a user.

        Args:
            user: User instance
            max_places: Maximum number of places to include in route
            category_filter: Optional list of category names to filter by

        Returns:
            Dictionary containing optimized route and metadata
        """
        # Get recommended places
        recommended_places = self.get_recommended_places(
            user, limit=max_places * 2, category_filter=category_filter
        )

        if not recommended_places:
            return {
                "places": [],
                "total_distance_km": 0.0,
                "estimated_duration_hours": 0.0,
                "average_score": 0.0,
            }

        # Select top places (limit to max_places)
        selected_places = recommended_places[:max_places]

        # Optimize route order
        optimized_route, total_distance = self.optimize_route_order(selected_places)

        # Calculate metadata
        average_score = sum(p["score"] for p in optimized_route) / len(optimized_route)
        estimated_duration = self._estimate_duration(
            total_distance, len(optimized_route)
        )

        return {
            "places": optimized_route,
            "total_distance_km": total_distance,
            "estimated_duration_hours": round(estimated_duration, 1),
            "average_score": round(average_score, 2),
            "user_location": {"lat": self.user_lat, "lng": self.user_lng},
        }

    def _get_primary_category(self, place: Place) -> Optional[str]:
        """Get the primary category name for a place."""
        primary_cat = (
            PlaceCategory.objects.filter(place=place, is_primary=True)
            .select_related("category")
            .first()
        )

        return primary_cat.category.name if primary_cat else None

    def _get_popular_places_nearby(self, limit: int) -> List[Dict]:
        """Get popular places nearby when user has no preferences."""
        places = Place.objects.filter(avg_rating__gte=4.0).order_by("-avg_rating")[
            :limit
        ]

        result = []
        for place in places:
            distance = calculate_distance_haversine(
                self.user_lat, self.user_lng, place.lat, place.lng
            )

            if distance <= self.max_distance_km:
                result.append(
                    {
                        "place": place,
                        "score": place.avg_rating / 5.0,  # Normalize rating to 0-1
                        "distance_km": round(distance, 2),
                        "primary_category": self._get_primary_category(place),
                    }
                )

        return result

    def _estimate_duration(self, total_distance_km: float, num_places: int) -> float:
        """
        Estimate total duration for the route.

        Args:
            total_distance_km: Total travel distance
            num_places: Number of places to visit

        Returns:
            Estimated duration in hours
        """
        # Assumptions:
        # - Average travel speed: 25 km/h (considering traffic, walking, etc.)
        # - Time per place: 1 hour on average

        travel_time_hours = total_distance_km / 25.0
        visit_time_hours = num_places * 1.0

        return travel_time_hours + visit_time_hours
