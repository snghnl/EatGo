import requests
from typing import Dict, List, Optional
from django.conf import settings


class GoogleMapsService:
    """Service for interacting with Google Maps API for detailed POI information"""

    BASE_URL = "https://maps.googleapis.com/maps/api"

    def __init__(self):
        self.api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", None)
        if not self.api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY not found in settings")

    def _make_request(self, endpoint: str, params: Dict) -> Dict:
        """Make authenticated request to Google Maps API"""
        params["key"] = self.api_key
        response = requests.get(f"{self.BASE_URL}/{endpoint}", params=params)
        response.raise_for_status()
        return response.json()

    def get_place_details(
        self, place_id: str, fields: Optional[List[str]] = None
    ) -> Dict:
        """
        Get detailed information about a place using Google Places API

        Args:
            place_id: Google place ID
            fields: List of fields to return. If None, returns basic fields.

        Returns:
            Dict containing place details
        """
        if fields is None:
            fields = [
                "place_id",
                "name",
                "formatted_address",
                "geometry",
                "photos",
                "rating",
                "user_ratings_total",
                "price_level",
                "opening_hours",
                "formatted_phone_number",
                "website",
                "types",
                "reviews",
            ]

        params = {"place_id": place_id, "fields": ",".join(fields), "language": "ko"}

        return self._make_request("place/details/json", params)

    def search_nearby(
        self,
        lat: float,
        lng: float,
        radius: int = 1500,
        place_type: Optional[str] = None,
        keyword: Optional[str] = None,
    ) -> Dict:
        """
        Search for places nearby a location

        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in meters (max 50000)
            place_type: Type of place to search for
            keyword: Keyword to search for

        Returns:
            Dict containing search results
        """
        params = {"location": f"{lat},{lng}", "radius": radius, "language": "ko"}

        if place_type:
            params["type"] = place_type
        if keyword:
            params["keyword"] = keyword

        return self._make_request("place/nearbysearch/json", params)

    def text_search(
        self, query: str, location: Optional[str] = None, radius: Optional[int] = None
    ) -> Dict:
        """
        Search for places using text query

        Args:
            query: Text query
            location: Location bias (lat,lng format)
            radius: Search radius in meters

        Returns:
            Dict containing search results
        """
        params = {"query": query, "language": "ko"}

        if location:
            params["location"] = location
        if radius:
            params["radius"] = radius

        return self._make_request("place/textsearch/json", params)

    def get_place_photos(self, photo_reference: str, max_width: int = 800) -> str:
        """
        Get photo URL for a place photo reference

        Args:
            photo_reference: Photo reference from place details
            max_width: Maximum width of the photo

        Returns:
            Photo URL
        """
        params = {"photo_reference": photo_reference, "maxwidth": max_width}

        return (
            f"{self.BASE_URL}/place/photo?"
            + "&".join([f"{k}={v}" for k, v in params.items()])
            + f"&key={self.api_key}"
        )

    def find_place(
        self,
        input_text: str,
        input_type: str = "textquery",
        location_bias: Optional[str] = None,
    ) -> Dict:
        """
        Find a place using various input types

        Args:
            input_text: Input text (place name, phone number, or address)
            input_type: Type of input ('textquery' or 'phonenumber')
            location_bias: Location bias in format 'point:lat,lng' or 'circle:radius@lat,lng'

        Returns:
            Dict containing search results
        """
        params = {
            "input": input_text,
            "inputtype": input_type,
            "fields": "place_id,name,geometry,formatted_address,types",
            "language": "ko",
        }

        if location_bias:
            params["locationbias"] = location_bias

        return self._make_request("place/findplacefromtext/json", params)
