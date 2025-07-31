import json
from unittest.mock import patch, Mock
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

from .views import calculate_distance_haversine

User = get_user_model()


class DistanceCalculationTest(TestCase):
    """Test cases for distance calculation functions"""

    def test_calculate_distance_haversine_same_point(self):
        """Test distance calculation for same point (should be 0)"""
        lat, lng = 37.5665, 126.9780  # Seoul coordinates
        distance = calculate_distance_haversine(lat, lng, lat, lng)
        self.assertEqual(distance, 0.0)

    def test_calculate_distance_haversine_known_distance(self):
        """Test distance calculation for known coordinates"""
        # Seoul to Busan (approximate distance: ~325km)
        seoul_lat, seoul_lng = 37.5665, 126.9780
        busan_lat, busan_lng = 35.1796, 129.0756

        distance = calculate_distance_haversine(
            seoul_lat, seoul_lng, busan_lat, busan_lng
        )

        # Allow for some margin of error (±10km)
        self.assertGreater(distance, 315.0)
        self.assertLess(distance, 335.0)

    def test_calculate_distance_haversine_short_distance(self):
        """Test distance calculation for short distances"""
        # Two points very close to each other
        lat1, lng1 = 37.5665, 126.9780
        lat2, lng2 = 37.5675, 126.9790  # About 0.14km apart

        distance = calculate_distance_haversine(lat1, lng1, lat2, lng2)

        # Should be around 0.1-0.2 km
        self.assertGreater(distance, 0.1)
        self.assertLess(distance, 0.3)


class DistanceAPITest(TestCase):
    """Test cases for distance calculation API endpoints"""

    def setUp(self):
        self.client = Client()

    def test_calculate_distance_api_valid_params(self):
        """Test distance API with valid parameters"""
        response = self.client.get(
            reverse("calculate_distance"),
            {
                "lat1": "37.5665",
                "lng1": "126.9780",
                "lat2": "35.1796",
                "lng2": "129.0756",
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("distance_km", data)
        self.assertIn("distance_m", data)
        self.assertIsInstance(data["distance_km"], (int, float))
        self.assertIsInstance(data["distance_m"], (int, float))

        # Check that meter conversion is correct
        self.assertEqual(data["distance_m"], data["distance_km"] * 1000)

    def test_calculate_distance_api_missing_params(self):
        """Test distance API with missing parameters"""
        response = self.client.get(reverse("calculate_distance"), {"lat1": "37.5665"})

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)

    def test_calculate_distance_api_invalid_params(self):
        """Test distance API with invalid parameters"""
        response = self.client.get(
            reverse("calculate_distance"),
            {
                "lat1": "invalid",
                "lng1": "126.9780",
                "lat2": "35.1796",
                "lng2": "129.0756",
            },
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)


class RouteAPITest(TestCase):
    """Test cases for Kakao route API"""

    def setUp(self):
        self.client = Client()

    @patch("kakaomap.views.requests.get")
    def test_get_route_info_success(self, mock_get):
        """Test successful route info retrieval"""
        # Mock successful Kakao API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "routes": [
                {
                    "summary": {
                        "distance": 15000,  # 15km in meters
                        "duration": 1800,  # 30 minutes in seconds
                        "fare": 1500,
                    }
                }
            ]
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        response = self.client.get(
            reverse("get_route_info"),
            {
                "origin_lat": "37.5665",
                "origin_lng": "126.9780",
                "destination_lat": "37.5000",
                "destination_lng": "127.0000",
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["distance_m"], 15000)
        self.assertEqual(data["distance_km"], 15.0)
        self.assertEqual(data["duration_sec"], 1800)
        self.assertEqual(data["duration_min"], 30.0)
        self.assertEqual(data["fare"], 1500)
        self.assertEqual(data["priority"], "RECOMMEND")

    @patch("kakaomap.views.requests.get")
    def test_get_route_info_no_route(self, mock_get):
        """Test route info when no route found"""
        # Mock Kakao API response with no routes
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"routes": []}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        response = self.client.get(
            reverse("get_route_info"),
            {
                "origin_lat": "37.5665",
                "origin_lng": "126.9780",
                "destination_lat": "37.5000",
                "destination_lng": "127.0000",
            },
        )

        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("error", data)

    def test_get_route_info_missing_params(self):
        """Test route info API with missing parameters"""
        response = self.client.get(reverse("get_route_info"), {"origin_lat": "37.5665"})

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)


class MultiPointDistanceAPITest(TestCase):
    """Test cases for multi-point distance optimization API"""

    def setUp(self):
        self.client = Client()

    def test_optimize_route_valid_points(self):
        """Test route optimization with valid points"""
        points_data = {
            "points": [
                {"lat": 37.5665, "lng": 126.9780},  # Seoul (start point)
                {"lat": 37.5700, "lng": 126.9800},  # Point 1
                {"lat": 37.5600, "lng": 126.9900},  # Point 2
                {"lat": 37.5500, "lng": 126.9700},  # Point 3
            ]
        }

        response = self.client.post(
            reverse("calculate_multi_point_distance"),
            data=json.dumps(points_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("total_distance_km", data)
        self.assertIn("optimized_order", data)
        self.assertIn("points_count", data)

        self.assertEqual(data["points_count"], 4)
        self.assertEqual(len(data["optimized_order"]), 4)
        self.assertEqual(data["optimized_order"][0], 0)  # Should start from first point
        self.assertIsInstance(data["total_distance_km"], (int, float))

    def test_optimize_route_insufficient_points(self):
        """Test route optimization with insufficient points"""
        points_data = {"points": [{"lat": 37.5665, "lng": 126.9780}]}

        response = self.client.post(
            reverse("calculate_multi_point_distance"),
            data=json.dumps(points_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)

    def test_optimize_route_invalid_json(self):
        """Test route optimization with invalid JSON"""
        response = self.client.post(
            reverse("calculate_multi_point_distance"),
            data="invalid json",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)

    def test_optimize_route_missing_coordinates(self):
        """Test route optimization with missing lat/lng"""
        points_data = {"points": [{"lat": 37.5665}, {"lng": 126.9780}]}

        response = self.client.post(
            reverse("calculate_multi_point_distance"),
            data=json.dumps(points_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)

    def test_optimize_route_get_method_not_allowed(self):
        """Test that GET method is not allowed for route optimization"""
        response = self.client.get(reverse("calculate_multi_point_distance"))

        self.assertEqual(response.status_code, 405)
        data = response.json()
        self.assertIn("error", data)


class KakaoMapAPITest(TestCase):
    """Test cases for Kakao static map API"""

    def setUp(self):
        self.client = Client()

    def test_get_kakao_map_valid_params(self):
        """Test static map API with valid parameters"""
        response = self.client.get(
            reverse("get_kakao_map"), {"lat": "37.5665", "lng": "126.9780"}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("map_url", data)
        self.assertIn("37.5665", data["map_url"])
        self.assertIn("126.9780", data["map_url"])

    def test_get_kakao_map_missing_params(self):
        """Test static map API with missing parameters"""
        response = self.client.get(reverse("get_kakao_map"), {"lat": "37.5665"})

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)


class SearchPlacesAPITest(TestCase):
    """Test cases for Kakao place search API"""

    def setUp(self):
        self.client = Client()

    @patch("kakaomap.views.requests.get")
    def test_search_places_success(self, mock_get):
        """Test successful place search"""
        # Mock successful Kakao API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "documents": [
                {
                    "place_name": "스타벅스 강남점",
                    "address_name": "서울 강남구 역삼동 123-45",
                    "road_address_name": "서울 강남구 테헤란로 123",
                    "x": "127.0276",
                    "y": "37.4979",
                    "id": "12345",
                    "place_url": "http://place.map.kakao.com/12345",
                    "category_group_code": "CE7",
                    "phone": "02-123-4567",
                }
            ]
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        response = self.client.get(
            reverse("search_places_from_kakao"), {"query": "스타벅스"}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), 1)

        place = data["results"][0]
        self.assertEqual(place["name"], "스타벅스 강남점")
        self.assertEqual(place["place_type"], "RESTAURANT")
        self.assertEqual(place["lat"], 37.4979)
        self.assertEqual(place["lng"], 127.0276)

    def test_search_places_missing_query(self):
        """Test place search with missing query"""
        response = self.client.get(reverse("search_places_from_kakao"))

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)
