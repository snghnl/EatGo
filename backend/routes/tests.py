from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from core.models import Category
from places.models import Place, PlaceCategory
from accounts.models import UserPreference
from .models import Route
from .recommendation_service import RouteRecommendationService

User = get_user_model()


class RouteViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass", email="testuser@test.com"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="otherpass", email="otheruser@test.com"
        )
        self.route = Route.objects.create(
            title="Test Route", description="A test route", created_by=self.user
        )
        # Note: places is a M2M, can be empty for basic tests

    def test_auth_required(self):
        response = self.client.get("/routes/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_routes(self):
        self.client.force_login(user=self.user)
        response = self.client.get("/routes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Only user's own routes should be listed
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], self.route.title)

    def test_create_route(self):
        self.client.force_login(user=self.user)
        data = {
            "title": "New Route",
            "description": "Another route",
        }
        response = self.client.post("/routes/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Route.objects.filter(created_by=self.user).count(), 1)

    def test_retrieve_route(self):
        self.client.force_login(user=self.user)
        response = self.client.get(f"/routes/{self.route.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.route.title)

    def test_update_route(self):
        self.client.force_login(user=self.user)
        data = {"title": "Updated Route"}
        response = self.client.patch(f"/routes/{self.route.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.route.refresh_from_db()
        self.assertEqual(self.route.title, "Updated Route")

    def test_delete_route(self):
        self.client.force_login(user=self.user)
        response = self.client.delete(f"/routes/{self.route.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Route.objects.filter(id=self.route.id).exists())

    def test_cannot_access_others_route(self):
        self.client.force_login(user=self.other_user)
        response = self.client.get(f"/routes/{self.route.id}/")
        # Should be 404 because get_queryset filters by created_by
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RouteRecommendationServiceTest(TestCase):
    """Test cases for RouteRecommendationService"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create categories
        self.cafe_category = Category.objects.create(
            name="카페", description="커피전문점", is_active=True
        )
        self.korean_category = Category.objects.create(
            name="한식", description="한국음식", is_active=True
        )
        self.italian_category = Category.objects.create(
            name="이탈리안", description="이탈리아음식", is_active=True
        )

        # Create user preferences
        UserPreference.objects.create(
            user=self.user, category=self.cafe_category, preference_score=0.9
        )
        UserPreference.objects.create(
            user=self.user, category=self.korean_category, preference_score=0.7
        )

        # Create places
        self.place1 = Place.objects.create(
            name="스타벅스 강남점",
            lat=37.5000,
            lng=127.0000,
            address="서울 강남구",
            avg_rating=4.2,
            place_type="RESTAURANT",
            external_id="place1",
        )

        self.place2 = Place.objects.create(
            name="한옥마을 한식당",
            lat=37.5100,
            lng=127.0100,
            address="서울 종로구",
            avg_rating=4.5,
            place_type="RESTAURANT",
            external_id="place2",
        )

        self.place3 = Place.objects.create(
            name="이탈리아 레스토랑",
            lat=37.4900,
            lng=126.9900,
            address="서울 마포구",
            avg_rating=4.0,
            place_type="RESTAURANT",
            external_id="place3",
        )

        # Create place categories
        PlaceCategory.objects.create(
            place=self.place1, category=self.cafe_category, is_primary=True
        )
        PlaceCategory.objects.create(
            place=self.place2, category=self.korean_category, is_primary=True
        )
        PlaceCategory.objects.create(
            place=self.place3, category=self.italian_category, is_primary=True
        )

        # Initialize service (Seoul coordinates)
        self.service = RouteRecommendationService(
            user_lat=37.5665, user_lng=126.9780, max_distance_km=20.0
        )

    def test_get_user_preferences(self):
        """Test getting user preferences"""
        preferences = self.service.get_user_preferences(self.user)

        self.assertEqual(len(preferences), 2)
        self.assertEqual(preferences["카페"], 0.9)
        self.assertEqual(preferences["한식"], 0.7)
        self.assertNotIn("이탈리안", preferences)

    def test_calculate_place_score(self):
        """Test place score calculation"""
        user_preferences = self.service.get_user_preferences(self.user)

        # Test cafe place (user has high preference)
        cafe_score = self.service.calculate_place_score(self.place1, user_preferences)
        self.assertGreater(cafe_score, 0.0)
        self.assertLessEqual(cafe_score, 1.0)

        # Test Korean place (user has medium preference)
        korean_score = self.service.calculate_place_score(self.place2, user_preferences)
        self.assertGreater(korean_score, 0.0)
        self.assertLessEqual(korean_score, 1.0)

        # Test Italian place (user has no preference)
        italian_score = self.service.calculate_place_score(
            self.place3, user_preferences
        )
        self.assertGreater(italian_score, 0.0)  # Should still have some score
        self.assertLessEqual(italian_score, 1.0)

        # Cafe should have higher score than Italian (due to preference)
        self.assertGreater(cafe_score, italian_score)

    def test_get_recommended_places(self):
        """Test getting recommended places"""
        recommendations = self.service.get_recommended_places(self.user, limit=10)

        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)

        # Check structure of recommendation
        if recommendations:
            rec = recommendations[0]
            self.assertIn("place", rec)
            self.assertIn("score", rec)
            self.assertIn("distance_km", rec)
            self.assertIn("primary_category", rec)

    def test_optimize_route_order(self):
        """Test route order optimization"""
        # Create mock place recommendations
        mock_places = [
            {
                "place": self.place1,
                "score": 0.8,
                "distance_km": 5.0,
                "primary_category": "카페",
            },
            {
                "place": self.place2,
                "score": 0.7,
                "distance_km": 8.0,
                "primary_category": "한식",
            },
        ]

        optimized_route, total_distance = self.service.optimize_route_order(mock_places)

        self.assertEqual(len(optimized_route), 2)
        self.assertIsInstance(total_distance, float)
        self.assertGreater(total_distance, 0.0)

    def test_generate_route_recommendation(self):
        """Test generating complete route recommendation"""
        recommendation = self.service.generate_route_recommendation(
            self.user, max_places=3
        )

        self.assertIn("places", recommendation)
        self.assertIn("total_distance_km", recommendation)
        self.assertIn("estimated_duration_hours", recommendation)
        self.assertIn("average_score", recommendation)
        self.assertIn("user_location", recommendation)

        # Check user location
        self.assertEqual(recommendation["user_location"]["lat"], 37.5665)
        self.assertEqual(recommendation["user_location"]["lng"], 126.9780)


class RouteAPITest(TestCase):
    """Test cases for Route API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create categories
        self.cafe_category = Category.objects.create(
            name="카페", description="커피전문점", is_active=True
        )
        self.korean_category = Category.objects.create(
            name="한식", description="한국음식", is_active=True
        )

        # Create user preferences
        UserPreference.objects.create(
            user=self.user, category=self.cafe_category, preference_score=0.9
        )

        # Create a place
        self.place = Place.objects.create(
            name="테스트 카페",
            lat=37.5000,
            lng=127.0000,
            address="서울 강남구",
            avg_rating=4.2,
            place_type="RESTAURANT",
            external_id="test_place",
        )

        PlaceCategory.objects.create(
            place=self.place, category=self.cafe_category, is_primary=True
        )

    def test_route_recommend_api_authenticated(self):
        """Test route recommendation API with authenticated user"""
        self.client.force_authenticate(user=self.user)

        data = {
            "user_lat": 37.5665,
            "user_lng": 126.9780,
            "max_places": 3,
            "max_distance_km": 20.0,
        }

        response = self.client.post("/routes/recommend/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()

        self.assertIn("places", response_data)
        self.assertIn("total_distance_km", response_data)
        self.assertIn("estimated_duration_hours", response_data)
        self.assertIn("average_score", response_data)
        self.assertIn("user_location", response_data)
        self.assertIn("metadata", response_data)

    def test_route_recommend_api_unauthenticated(self):
        """Test route recommendation API without authentication"""
        data = {
            "user_lat": 37.5665,
            "user_lng": 126.9780,
            "max_places": 3,
        }

        response = self.client.post("/routes/recommend/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_route_recommend_api_invalid_params(self):
        """Test route recommendation API with invalid parameters"""
        self.client.force_authenticate(user=self.user)

        # Missing required parameters
        data = {"max_places": 3}

        response = self.client.post("/routes/recommend/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_route_recommend_api_with_category_filter(self):
        """Test route recommendation API with category filter"""
        self.client.force_authenticate(user=self.user)

        data = {
            "user_lat": 37.5665,
            "user_lng": 126.9780,
            "max_places": 3,
            "category_filter": ["카페"],
        }

        response = self.client.post("/routes/recommend/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserPreferencesAPITest(TestCase):
    """Test cases for User Preferences API"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.cafe_category = Category.objects.create(
            name="카페", description="커피전문점", is_active=True
        )
        self.korean_category = Category.objects.create(
            name="한식", description="한국음식", is_active=True
        )

    def test_get_user_preferences_authenticated(self):
        """Test getting user preferences with authentication"""
        self.client.force_authenticate(user=self.user)

        # Create some preferences
        UserPreference.objects.create(
            user=self.user, category=self.cafe_category, preference_score=0.8
        )

        response = self.client.get("/routes/preferences/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("preferences", data)
        self.assertIn("available_categories", data)
        self.assertEqual(data["preferences"]["카페"], 0.8)

    def test_get_user_preferences_unauthenticated(self):
        """Test getting user preferences without authentication"""
        response = self.client.get("/routes/preferences/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_set_user_preferences_valid(self):
        """Test setting user preferences with valid data"""
        self.client.force_authenticate(user=self.user)

        data = {"preferences": {"카페": 0.9, "한식": 0.7}}

        response = self.client.post("/routes/preferences/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()

        self.assertIn("message", response_data)
        self.assertIn("created", response_data)
        self.assertEqual(response_data["created"], 2)

        # Verify preferences were created
        cafe_pref = UserPreference.objects.get(
            user=self.user, category=self.cafe_category
        )
        self.assertEqual(cafe_pref.preference_score, 0.9)

    def test_set_user_preferences_invalid_score(self):
        """Test setting user preferences with invalid score"""
        self.client.force_authenticate(user=self.user)

        data = {"preferences": {"카페": 1.5}}  # Invalid score > 1.0

        response = self.client.post("/routes/preferences/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_user_preferences_invalid_category(self):
        """Test setting user preferences with invalid category"""
        self.client.force_authenticate(user=self.user)

        data = {"preferences": {"존재하지않는카테고리": 0.8}}

        response = self.client.post("/routes/preferences/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_existing_preference(self):
        """Test updating existing preference"""
        self.client.force_authenticate(user=self.user)

        # Create initial preference
        UserPreference.objects.create(
            user=self.user, category=self.cafe_category, preference_score=0.5
        )

        # Update preference
        data = {"preferences": {"카페": 0.9}}

        response = self.client.post("/routes/preferences/", data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()

        self.assertEqual(response_data["updated"], 1)
        self.assertEqual(response_data["created"], 0)

        # Verify preference was updated
        pref = UserPreference.objects.get(user=self.user, category=self.cafe_category)
        self.assertEqual(pref.preference_score, 0.9)


class CategoriesAPITest(TestCase):
    """Test cases for Categories API"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.active_category = Category.objects.create(
            name="카페",
            description="커피전문점",
            icon="coffee",
            color="#8B4513",
            category_type="FOOD",
            is_active=True,
        )

        self.inactive_category = Category.objects.create(
            name="비활성카테고리", description="테스트용", is_active=False
        )

    def test_get_categories_authenticated(self):
        """Test getting categories with authentication"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/routes/categories/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("categories", data)
        categories = data["categories"]

        # Should only return active categories
        self.assertEqual(len(categories), 1)
        category = categories[0]

        self.assertEqual(category["name"], "카페")
        self.assertEqual(category["description"], "커피전문점")
        self.assertEqual(category["icon"], "coffee")
        self.assertEqual(category["color"], "#8B4513")
        self.assertEqual(category["category_type"], "FOOD")

    def test_get_categories_unauthenticated(self):
        """Test getting categories without authentication"""
        response = self.client.get("/routes/categories/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
