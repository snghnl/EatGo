from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Category
from .models import UserPreference

User = get_user_model()


class UserPreferenceModelTest(TestCase):
    """Test cases for UserPreference model"""

    def setUp(self):
        """Set up test data"""
        self.user1 = User.objects.create_user(
            username="testuser1", email="test1@example.com", password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="testuser2", email="test2@example.com", password="testpass123"
        )

        self.category1 = Category.objects.create(
            name="카페", description="커피전문점", is_active=True
        )
        self.category2 = Category.objects.create(
            name="한식", description="한국음식", is_active=True
        )

    def test_create_user_preference(self):
        """Test creating a valid user preference"""
        preference = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.8
        )

        self.assertEqual(preference.user, self.user1)
        self.assertEqual(preference.category, self.category1)
        self.assertEqual(preference.preference_score, 0.8)
        self.assertIsNotNone(preference.id)
        self.assertIsNotNone(preference.created_at)
        self.assertIsNotNone(preference.updated_at)

    def test_unique_user_category_constraint(self):
        """Test that user-category combination must be unique"""
        # Create first preference
        UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.8
        )

        # Try to create duplicate preference for same user-category
        with self.assertRaises(IntegrityError):
            UserPreference.objects.create(
                user=self.user1, category=self.category1, preference_score=0.9
            )

    def test_different_users_same_category(self):
        """Test that different users can have preferences for same category"""
        pref1 = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.8
        )
        pref2 = UserPreference.objects.create(
            user=self.user2, category=self.category1, preference_score=0.6
        )

        self.assertNotEqual(pref1.id, pref2.id)
        self.assertEqual(pref1.category, pref2.category)

    def test_valid_preference_score_range(self):
        """Test valid preference score values (0.0 to 1.0)"""
        # Test boundary values
        valid_scores = [0.0, 0.1, 0.5, 0.9, 1.0]

        for score in valid_scores:
            with self.subTest(score=score):
                preference = UserPreference.objects.create(
                    user=self.user1,
                    category=self.category1,
                    preference_score=score,
                )
                # Delete after each test to avoid unique constraint
                preference.delete()

    def test_invalid_preference_score_negative(self):
        """Test invalid preference score (negative value)"""
        from django.db import transaction

        with transaction.atomic():
            with self.assertRaises(IntegrityError):
                UserPreference.objects.create(
                    user=self.user1,
                    category=self.category1,
                    preference_score=-0.1,
                )

    def test_invalid_preference_score_too_high(self):
        """Test invalid preference score (value > 1.0)"""
        from django.db import transaction

        with transaction.atomic():
            with self.assertRaises(IntegrityError):
                UserPreference.objects.create(
                    user=self.user1,
                    category=self.category1,
                    preference_score=1.1,
                )

    def test_str_representation(self):
        """Test string representation of UserPreference"""
        preference = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.85
        )

        expected_str = f"{self.user1.username} - {self.category1.name}: 0.85"
        self.assertEqual(str(preference), expected_str)

    def test_related_name_access(self):
        """Test accessing preferences through related names"""
        pref1 = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.8
        )
        pref2 = UserPreference.objects.create(
            user=self.user1, category=self.category2, preference_score=0.6
        )

        # Test user.user_preferences
        user_prefs = self.user1.user_preferences.all()
        self.assertEqual(user_prefs.count(), 2)
        self.assertIn(pref1, user_prefs)
        self.assertIn(pref2, user_prefs)

        # Test category.user_preferences
        category_prefs = self.category1.user_preferences.all()
        self.assertEqual(category_prefs.count(), 1)
        self.assertEqual(category_prefs.first(), pref1)

    def test_update_preference_score(self):
        """Test updating preference score"""
        preference = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.5
        )

        # Update score
        preference.preference_score = 0.9
        preference.save()

        # Reload from database
        preference.refresh_from_db()
        self.assertEqual(preference.preference_score, 0.9)

    def test_cascade_delete_user(self):
        """Test that preferences are deleted when user is deleted"""
        preference = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.8
        )
        preference_id = preference.id

        # Delete user
        self.user1.delete()

        # Check preference is also deleted
        with self.assertRaises(UserPreference.DoesNotExist):
            UserPreference.objects.get(id=preference_id)

    def test_cascade_delete_category(self):
        """Test that preferences are deleted when category is deleted"""
        preference = UserPreference.objects.create(
            user=self.user1, category=self.category1, preference_score=0.8
        )
        preference_id = preference.id

        # Delete category
        self.category1.delete()

        # Check preference is also deleted
        with self.assertRaises(UserPreference.DoesNotExist):
            UserPreference.objects.get(id=preference_id)


class DeleteAccountViewTest(APITestCase):
    """Test cases for DeleteAccountView"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.delete_url = reverse("delete_account")

    def test_delete_account_authenticated(self):
        """Test successful account deletion with authentication"""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        # Store user ID for verification
        user_id = self.user.id

        # Make delete request
        response = self.client.delete(self.delete_url)

        # Check response
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn("계정이 성공적으로 삭제되었습니다", response.data["message"])

        # Verify user is deleted
        with self.assertRaises(User.DoesNotExist):
            User.objects.get(id=user_id)

    def test_delete_account_unauthenticated(self):
        """Test account deletion without authentication should fail"""
        response = self.client.delete(self.delete_url)

        # Should require authentication
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # User should still exist
        self.assertTrue(User.objects.filter(id=self.user.id).exists())

    def test_delete_account_with_related_data(self):
        """Test account deletion removes related data"""
        # Create category for preferences
        category = Category.objects.create(
            name="테스트카테고리", description="테스트용", is_active=True
        )

        # Create user preference
        preference = UserPreference.objects.create(
            user=self.user, category=category, preference_score=0.8
        )
        preference_id = preference.id

        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        # Delete account
        response = self.client.delete(self.delete_url)

        # Check response
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify user and related preference are deleted
        with self.assertRaises(User.DoesNotExist):
            User.objects.get(id=self.user.id)

        with self.assertRaises(UserPreference.DoesNotExist):
            UserPreference.objects.get(id=preference_id)
