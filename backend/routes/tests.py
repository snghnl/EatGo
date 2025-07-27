from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Route

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
