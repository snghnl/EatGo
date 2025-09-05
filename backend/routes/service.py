"""
Route recommendation service based on user preferences and distance optimization.
"""

import math
from typing import List, Dict, Tuple, Optional
from django.contrib.auth import get_user_model
from third_party_maps.kakao_service import KakaoMapService
from accounts.models import UserPreference

User = get_user_model()


def calculate_distance_haversine(
    lat1: float, lng1: float, lat2: float, lng2: float
) -> float:
    """
    Calculate the great circle distance between two points on Earth using Haversine formula.

    Args:
        lat1, lng1: Latitude and longitude of first point
        lat2, lng2: Latitude and longitude of second point

    Returns:
        Distance in kilometers
    """
    # Convert latitude and longitude from degrees to radians
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])

    # Haversine formula
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in kilometers
    r = 6371

    return c * r


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
        self.kakao_service = KakaoMapService()

    def get_places_data(
        self,
        lat: float,
        lng: float,
        max_distance_km: float = 20.0,
        limit: int = 10,
        categories: List[str] = None,
    ):
        """
        Get places data from Kakao API.
        """
        categories = ",".join(categories)
        response = self.kakao_service.search_by_keyword(
            query=categories,
            x=lng,
            y=lat,
            radius=max_distance_km * 1000,
            size=limit,
        )
        return response.get("documents", [])

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

    def calculate_external_place_score(
        self, place_data: Dict, user_preferences: Dict[str, float] = None
    ) -> float:
        """
        Calculate a composite score for an external place (from Kakao API) based on distance and rating.

        Args:
            place_data: Dictionary containing place data with keys: 'x', 'y', 'place_name', 'category_name', etc.
            user_preferences: Dictionary of user category preferences (optional)

        Returns:
            Composite score (0.0-1.0)
        """
        lat = float(place_data.get("y", 0))
        lng = float(place_data.get("x", 0))

        # Distance component (closer = higher score)
        distance = calculate_distance_haversine(self.user_lat, self.user_lng, lat, lng)

        if distance > self.max_distance_km:
            return 0.0

        # Distance score: 1.0 at 0km, decreasing to 0.0 at max_distance_km
        distance_score = max(0.0, 1.0 - (distance / self.max_distance_km))

        # Preference component (simplified for external places)
        preference_score = 0.5  # Default neutral score
        if user_preferences and place_data.get("category_name"):
            category = place_data["category_name"]
            preference_score = user_preferences.get(category, 0.5)

        # Rating component - use distance as proxy for popularity if no rating available
        rating_score = max(0.3, distance_score)  # Minimum base score

        # Composite score: weighted average
        composite_score = (
            preference_score * 0.4  # 40% preference
            + distance_score * 0.4  # 40% distance
            + rating_score * 0.2  # 20% rating/popularity
        )

        return min(1.0, max(0.0, composite_score))

    def generate_route_from_external_places(
        self,
        places_data: List[Dict],
        user_preferences: Optional[Dict[str, float]] = None,
        max_places: int = 10,
    ) -> List[Dict]:
        """
        Generate route recommendations from external place data (e.g., from Kakao API).

        Args:
            places_data: List of place dictionaries from external API
            user_preferences: Optional user category preferences
            max_places: Maximum number of places to include in route

        Returns:
            List of dictionaries containing place info and scores, sorted by composite score
        """
        recommended_places = []

        for place_data in places_data:
            score = self.calculate_external_place_score(place_data, user_preferences)

            if score > 0.1:  # Only include places with reasonable scores
                lat = float(place_data.get("y", 0))
                lng = float(place_data.get("x", 0))
                distance = calculate_distance_haversine(
                    self.user_lat, self.user_lng, lat, lng
                )

                recommended_places.append(
                    {
                        "place_data": place_data,
                        "score": score,
                        "distance_km": round(distance, 2),
                        "lat": lat,
                        "lng": lng,
                        "name": place_data.get("place_name", "Unknown"),
                        "category": place_data.get("category_name", "Unknown"),
                    }
                )

        # Sort by score (descending) and return top results
        recommended_places.sort(key=lambda x: x["score"], reverse=True)
        return recommended_places[:max_places]

    def optimize_route_order(self, places: List[Dict]) -> Tuple[List[Dict], float]:
        """
        Optimize the order of places to minimize total travel distance.
        Uses a simple nearest neighbor algorithm.

        Args:
            places: List of place dictionaries (supports both internal Place objects and external place data)

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
                # Handle both internal Place objects and external place data
                if "place" in place_info:  # Internal Place object
                    place_lat = place_info["place"].lat
                    place_lng = place_info["place"].lng
                else:  # External place data
                    place_lat = place_info["lat"]
                    place_lng = place_info["lng"]

                distance = calculate_distance_haversine(
                    current_lat, current_lng, place_lat, place_lng
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

                # Update current position
                if "place" in nearest_place:  # Internal Place object
                    current_lat = nearest_place["place"].lat
                    current_lng = nearest_place["place"].lng
                else:  # External place data
                    current_lat = nearest_place["lat"]
                    current_lng = nearest_place["lng"]

        return optimized_route, round(total_distance, 2)

    def generate_optimized_route(
        self,
        places_data: List[Dict],
        user_preferences: Optional[Dict[str, float]] = None,
        max_places: int = 5,
    ) -> Dict:
        """
        Generate a complete optimized route from external place data.

        Args:
            places_data: List of place dictionaries from external API (e.g., Kakao)
            user_preferences: Optional user category preferences
            max_places: Maximum number of places to include in route

        Returns:
            Dictionary containing optimized route and metadata
        """
        # Get recommended places from external data
        recommended_places = self.generate_route_from_external_places(
            places_data,
            user_preferences=user_preferences,
            max_places=max_places * 2,  # Get more candidates for better optimization
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

    def filter_places_by_distance(self, places_data: List[Dict]) -> List[Dict]:
        """
        Filter external places by maximum distance from user location.

        Args:
            places_data: List of place dictionaries from external API

        Returns:
            Filtered list of places within max_distance_km
        """
        filtered_places = []

        for place_data in places_data:
            lat = float(place_data.get("y", 0))
            lng = float(place_data.get("x", 0))

            distance = calculate_distance_haversine(
                self.user_lat, self.user_lng, lat, lng
            )

            if distance <= self.max_distance_km:
                filtered_places.append(place_data)

        return filtered_places

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

    def generate_multiple_routes(
        self,
        places_data: List[Dict],
        user_preferences: Optional[Dict[str, float]] = None,
        max_places: int = 5,
        num_routes: int = 3,
    ) -> Dict:
        """
        Generate multiple route variations.

        Args:
            places_data: List of place dictionaries from external API
            user_preferences: Optional user category preferences
            max_places: Maximum number of places to include in route
            num_routes: Number of different routes to generate

        Returns:
            Dictionary containing multiple routes and user location
        """
        routes = []

        # Generate routes with different max_places
        place_counts = [max_places, max(3, max_places - 2), max(3, max_places - 4)]

        for count in place_counts[:num_routes]:
            route = self.generate_optimized_route(
                places_data=places_data,
                user_preferences=user_preferences,
                max_places=count,
            )
            if route["places"]:
                routes.append(route)

        # If we need more routes and have data, create variations
        import random

        while len(routes) < num_routes and routes and len(places_data) > max_places:
            # Create a route with different starting preference weights
            modified_preferences = user_preferences.copy() if user_preferences else {}
            if modified_preferences:
                # Slightly modify preference weights for variation
                for category in modified_preferences:
                    modified_preferences[category] = min(
                        1.0, modified_preferences[category] + random.uniform(-0.2, 0.2)
                    )

            alt_route = self.generate_optimized_route(
                places_data=places_data,
                user_preferences=modified_preferences,
                max_places=max_places,
            )

            # Only add if it's different enough from existing routes
            if alt_route["places"] and not self._is_similar_route(alt_route, routes):
                routes.append(alt_route)
            else:
                break

        return {
            "routes": routes,
            "user_location": {"lat": self.user_lat, "lng": self.user_lng},
        }

    def _is_similar_route(self, new_route: Dict, existing_routes: List[Dict]) -> bool:
        """Check if a route is too similar to existing ones."""
        new_place_names = set(place["name"] for place in new_route["places"])

        for existing_route in existing_routes:
            existing_place_names = set(
                place["name"] for place in existing_route["places"]
            )

            # If more than 70% of places are the same, consider it similar
            overlap = len(new_place_names.intersection(existing_place_names))
            if overlap / len(new_place_names) > 0.7:
                return True

        return False

    def get_route_summary(self, optimized_route: List[Dict]) -> str:
        """
        Generate a human-readable summary of the route.

        Args:
            optimized_route: List of optimized places

        Returns:
            String summary of the route
        """
        if not optimized_route:
            return "No places in route"

        place_names = []
        for place_info in optimized_route:
            if "place" in place_info:  # Internal Place object
                place_names.append(place_info["place"].name)
            else:  # External place data
                place_names.append(place_info["name"])

        return " → ".join(place_names)
