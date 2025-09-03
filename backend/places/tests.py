from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import Mock, patch
import uuid

from .models import Place, MenuItem, PlaceCategory
from core.models import Category
from third_party_maps.kakao_service import KakaoMapService

User = get_user_model()


class PlaceListAPIViewTest(APITestCase):
    """Test cases for PlaceListAPIView"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.place1 = Place.objects.create(
            name="Test Restaurant 1",
            lat=37.5665,
            lng=126.9780,
            phone_number="02-1234-5678",
            avg_rating=4.5,
            place_type=Place.PlaceType.RESTAURANT,
            address="Seoul Test Address 1",
            external_id="kakao_1234",
            created_by=self.user,
        )

        self.place2 = Place.objects.create(
            name="Test Attraction 1",
            lat=37.5642,
            lng=126.9758,
            phone_number="02-8765-4321",
            avg_rating=4.2,
            place_type=Place.PlaceType.ATTRACTION,
            address="Seoul Test Address 2",
            external_id="kakao_5678",
            created_by=self.user,
        )

    def test_place_list_view_returns_all_places(self):
        """Test that the list view returns all places"""
        url = reverse("place-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        place_names = [place["name"] for place in response.data]
        self.assertIn("Test Restaurant 1", place_names)
        self.assertIn("Test Attraction 1", place_names)

    def test_place_list_view_returns_correct_data_structure(self):
        """Test that the list view returns correct data structure"""
        url = reverse("place-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        first_place = response.data[0]
        expected_fields = [
            "id",
            "name",
            "lat",
            "lng",
            "phone_number",
            "avg_rating",
            "place_type",
            "address",
            "road_address",
            "external_id",
            "external_url",
        ]

        for field in expected_fields:
            self.assertIn(field, first_place)

    def test_place_list_view_empty_database(self):
        """Test list view when no places exist"""
        Place.objects.all().delete()

        url = reverse("place-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class MenuItemListAPIViewTest(APITestCase):
    """Test cases for MenuItemListAPIView"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.place = Place.objects.create(
            name="Test Restaurant",
            lat=37.5665,
            lng=126.9780,
            place_type=Place.PlaceType.RESTAURANT,
            external_id="kakao_test",
            created_by=self.user,
        )

        self.menu_item1 = MenuItem.objects.create(
            place=self.place,
            name="Bulgogi",
            price=15000,
            description="Korean BBQ",
            is_active=True,
        )

        self.menu_item2 = MenuItem.objects.create(
            place=self.place,
            name="Kimchi Jjigae",
            price=8000,
            description="Kimchi stew",
            is_active=True,
        )

    def test_menu_item_list_for_place(self):
        """Test menu items list for a specific place"""
        url = reverse("menu-item-list", kwargs={"pk": self.place.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        menu_names = [item["name"] for item in response.data]
        self.assertIn("Bulgogi", menu_names)
        self.assertIn("Kimchi Jjigae", menu_names)

    def test_menu_item_list_nonexistent_place(self):
        """Test menu items list for non-existent place"""
        non_existent_id = uuid.uuid4()
        url = reverse("menu-item-list", kwargs={"pk": non_existent_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class KakaoMapServiceTest(TestCase):
    """Test cases for KakaoMapService recommendation features"""

    def setUp(self):
        self.mock_api_key = "test_api_key"

    @patch("third_party_maps.kakao_service.settings")
    def test_kakao_service_initialization(self, mock_settings):
        """Test KakaoMapService initialization with API key"""
        mock_settings.KAKAO_REST_API_KEY = self.mock_api_key

        service = KakaoMapService()
        self.assertEqual(service.api_key, self.mock_api_key)

    @patch("third_party_maps.kakao_service.settings")
    def test_kakao_service_initialization_no_api_key(self, mock_settings):
        """Test KakaoMapService initialization fails without API key"""
        mock_settings.KAKAO_REST_API_KEY = None

        with self.assertRaises(ValueError):
            KakaoMapService()

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_search_by_keyword_success(self, mock_get, mock_settings):
        """Test successful keyword search"""
        mock_settings.KAKAO_REST_API_KEY = self.mock_api_key

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "documents": [
                {
                    "place_name": "Test Restaurant",
                    "category_name": "food > restaurant",
                    "phone": "02-1234-5678",
                    "address_name": "Seoul Test Address",
                    "road_address_name": "Seoul Test Road",
                    "id": "12345",
                    "place_url": "http://place.map.kakao.com/12345",
                    "x": "126.9780",
                    "y": "37.5665",
                }
            ],
            "meta": {"total_count": 1, "pageable_count": 1, "is_end": True},
        }
        mock_get.return_value = mock_response

        service = KakaoMapService()
        result = service.search_by_keyword("맛집")

        self.assertIn("documents", result)
        self.assertEqual(len(result["documents"]), 1)
        self.assertEqual(result["documents"][0]["place_name"], "Test Restaurant")

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_search_by_keyword_with_location(self, mock_get, mock_settings):
        """Test keyword search with location parameters"""
        mock_settings.KAKAO_REST_API_KEY = self.mock_api_key

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        service = KakaoMapService()
        service.search_by_keyword("맛집", x=126.9780, y=37.5665, radius=10000)

        mock_get.assert_called_once()
        call_args = mock_get.call_args
        params = call_args[1]["params"]

        self.assertEqual(params["x"], 126.9780)
        self.assertEqual(params["y"], 37.5665)
        self.assertEqual(params["radius"], 10000)

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_search_by_category_success(self, mock_get, mock_settings):
        """Test successful category search"""
        mock_settings.KAKAO_REST_API_KEY = self.mock_api_key

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "documents": [
                {
                    "place_name": "Test Restaurant",
                    "category_group_code": "FD6",
                    "category_group_name": "음식점",
                    "x": "126.9780",
                    "y": "37.5665",
                }
            ]
        }
        mock_get.return_value = mock_response

        service = KakaoMapService()
        result = service.search_by_category("FD6", x=126.9780, y=37.5665)

        self.assertIn("documents", result)
        self.assertEqual(len(result["documents"]), 1)
        self.assertEqual(result["documents"][0]["category_group_code"], "FD6")

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_api_request_failure(self, mock_get, mock_settings):
        """Test handling of API request failures"""
        mock_settings.KAKAO_REST_API_KEY = self.mock_api_key

        mock_get.side_effect = Exception("Network error")

        service = KakaoMapService()
        with self.assertRaises(Exception) as context:
            service.search_by_keyword("맛집")

        self.assertIn("Kakao API request failed", str(context.exception))

    def test_get_category_name(self):
        """Test category code to name conversion"""
        self.assertEqual(KakaoMapService.get_category_name("FD6"), "음식점")
        self.assertEqual(KakaoMapService.get_category_name("CE7"), "카페")
        self.assertEqual(KakaoMapService.get_category_name("UNKNOWN"), "UNKNOWN")

    def test_get_available_categories(self):
        """Test getting all available categories"""
        categories = KakaoMapService.get_available_categories()

        self.assertIsInstance(categories, dict)
        self.assertIn("FD6", categories)
        self.assertEqual(categories["FD6"], "음식점")


class KakaoRecommendationIntegrationTest(APITestCase):
    """Integration test for Kakao API recommendation features"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_recommendation_workflow(self, mock_get, mock_settings):
        """Test complete recommendation workflow using Kakao API"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "documents": [
                {
                    "place_name": "Recommended Restaurant 1",
                    "category_name": "food > restaurant > korean",
                    "phone": "02-1111-1111",
                    "address_name": "Seoul Gangnam",
                    "road_address_name": "Seoul Gangnam Road",
                    "id": "rec_001",
                    "place_url": "http://place.map.kakao.com/rec_001",
                    "x": "127.0276",
                    "y": "37.4979",
                },
                {
                    "place_name": "Recommended Restaurant 2",
                    "category_name": "food > restaurant > japanese",
                    "phone": "02-2222-2222",
                    "address_name": "Seoul Seocho",
                    "road_address_name": "Seoul Seocho Road",
                    "id": "rec_002",
                    "place_url": "http://place.map.kakao.com/rec_002",
                    "x": "127.0311",
                    "y": "37.4845",
                },
            ],
            "meta": {"total_count": 2, "pageable_count": 2, "is_end": True},
        }
        mock_get.return_value = mock_response

        service = KakaoMapService()

        result = service.search_by_keyword("맛집 추천", x=127.0276, y=37.4979, size=15)

        self.assertIn("documents", result)
        self.assertEqual(len(result["documents"]), 2)

        places = result["documents"]
        place_names = [place["place_name"] for place in places]
        self.assertIn("Recommended Restaurant 1", place_names)
        self.assertIn("Recommended Restaurant 2", place_names)

        for place in places:
            self.assertIn("place_name", place)
            self.assertIn("category_name", place)
            self.assertIn("x", place)
            self.assertIn("y", place)


class PlaceRecommendViewTest(APITestCase):
    """Test cases for PlaceRecommendView"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create test places with different ratings and locations
        self.place1 = Place.objects.create(
            name="High Rated Restaurant",
            lat=37.5665,
            lng=126.9780,
            phone_number="02-1234-5678",
            avg_rating=4.8,
            place_type=Place.PlaceType.RESTAURANT,
            address="Seoul Test Address 1",
            external_id="kakao_1234",
            created_by=self.user,
        )

        self.place2 = Place.objects.create(
            name="Medium Rated Restaurant",
            lat=37.5642,
            lng=126.9758,
            phone_number="02-8765-4321",
            avg_rating=4.2,
            place_type=Place.PlaceType.RESTAURANT,
            address="Seoul Test Address 2",
            external_id="kakao_5678",
            created_by=self.user,
        )

        self.place3 = Place.objects.create(
            name="Low Rated Restaurant",
            lat=37.5000,
            lng=127.0000,
            phone_number="02-1111-2222",
            avg_rating=3.5,
            place_type=Place.PlaceType.RESTAURANT,
            address="Seoul Test Address 3",
            external_id="kakao_9999",
            created_by=self.user,
        )

        # Create categories
        self.category1 = Category.objects.create(
            name="Korean Food", category_type=Category.CategoryType.FOOD
        )
        self.category2 = Category.objects.create(
            name="Japanese Food", category_type=Category.CategoryType.FOOD
        )

        # Create place-category relationships
        PlaceCategory.objects.create(
            place=self.place1, category=self.category1, is_primary=True
        )
        PlaceCategory.objects.create(
            place=self.place2, category=self.category2, is_primary=True
        )

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_place_recommend_basic_request(self, mock_get, mock_settings):
        """Test basic place recommendation request using GET with query params"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        url = reverse("place-recommend")
        response = self.client.get(url, {"lat": 37.5665, "lng": 126.9780})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("places", response.data)

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_place_recommend_with_distance_filter(self, mock_get, mock_settings):
        """Test place recommendation with distance filter"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        url = reverse("place-recommend")
        response = self.client.get(
            url, {"lat": 37.5665, "lng": 126.9780, "max_distance_km": 1.0}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("places", response.data)
        # With 1km filter, should return only nearby places
        places = response.data["places"]
        for place in places:
            # All returned places should be within reasonable distance
            self.assertIsInstance(place, dict)

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_place_recommend_with_limit(self, mock_get, mock_settings):
        """Test place recommendation with limit"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        url = reverse("place-recommend")
        response = self.client.get(url, {"lat": 37.5665, "lng": 126.9780, "limit": 1})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("places", response.data)
        self.assertLessEqual(len(response.data["places"]), 1)

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_place_recommend_with_category_filter(self, mock_get, mock_settings):
        """Test place recommendation with category filter"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        url = reverse("place-recommend")
        response = self.client.get(
            url,
            {
                "lat": 37.5665,
                "lng": 126.9780,
                "category_filter": "Korean Food",  # Single category as string
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("places", response.data)

        # Should only return places with Korean Food category
        places = response.data["places"]
        if places:
            place_ids = [place["id"] for place in places]
            self.assertIn(str(self.place1.id), place_ids)
            # Should not contain places with different categories
            self.assertNotIn(str(self.place2.id), place_ids)

    def test_place_recommend_invalid_data(self):
        """Test place recommendation with invalid data"""
        url = reverse("place-recommend")
        response = self.client.get(url, {"lat": "invalid_lat", "lng": 126.9780})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_place_recommend_missing_required_fields(self):
        """Test place recommendation with missing required fields"""
        url = reverse("place-recommend")

        # Test missing lat
        response = self.client.get(url, {"lng": 126.9780})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test missing lng
        response = self.client.get(url, {"lat": 37.5665})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_place_recommend_ordering_by_rating(self, mock_get, mock_settings):
        """Test that places are ordered by rating (highest first)"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        url = reverse("place-recommend")
        response = self.client.get(url, {"lat": 37.5665, "lng": 126.9780, "limit": 10})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("places", response.data)

        places = response.data["places"]
        if len(places) > 1:
            # Check that places are ordered by rating (highest first)
            ratings = [
                place["avg_rating"]
                for place in places
                if place["avg_rating"] is not None
            ]
            self.assertEqual(ratings, sorted(ratings, reverse=True))

    @patch("third_party_maps.kakao_service.settings")
    def test_place_recommend_no_kakao_api_key(self, mock_settings):
        """Test place recommendation fails without Kakao API key"""
        mock_settings.KAKAO_REST_API_KEY = None

        url = reverse("place-recommend")
        response = self.client.get(url, {"lat": 37.5665, "lng": 126.9780})

        # Should fail during KakaoMapService initialization
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    @patch("third_party_maps.kakao_service.settings")
    @patch("third_party_maps.kakao_service.requests.get")
    def test_place_recommend_with_all_filters(self, mock_get, mock_settings):
        """Test place recommendation with all possible filters"""
        mock_settings.KAKAO_REST_API_KEY = "test_key"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"documents": [], "meta": {"total_count": 0}}
        mock_get.return_value = mock_response

        url = reverse("place-recommend")
        response = self.client.get(
            url,
            {
                "lat": 37.5665,
                "lng": 126.9780,
                "max_distance_km": 5.0,
                "limit": 5,
                "category_filter": "Korean Food",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("places", response.data)
        self.assertLessEqual(len(response.data["places"]), 5)
