from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
import uuid

from .models import District, Province


class DistrictModelTest(TestCase):
    def setUp(self):
        self.province = Province.objects.create(
            name="서울특별시", name_en="Seoul Special City"
        )

    def test_district_creation(self):
        district = District.objects.create(
            province=self.province,
            name="강남구",
            name_en="Gangnam-gu",
            longitude=Decimal("127.047778"),
            latitude=Decimal("37.517305"),
        )

        self.assertEqual(str(district), "서울특별시 강남구")
        self.assertTrue(district.is_active)
        self.assertEqual(district.province, self.province)


class ProvinceModelTest(TestCase):
    def test_province_creation(self):
        province = Province.objects.create(
            name="부산광역시", name_en="Busan Metropolitan City"
        )

        self.assertEqual(str(province), "부산광역시")
        self.assertTrue(province.is_active)


class DistrictAPITest(APITestCase):
    def setUp(self):
        self.province1 = Province.objects.create(
            name="서울특별시", name_en="Seoul Special City"
        )
        self.province2 = Province.objects.create(
            name="부산광역시", name_en="Busan Metropolitan City"
        )

        self.district1 = District.objects.create(
            province=self.province1,
            name="강남구",
            name_en="Gangnam-gu",
            longitude=Decimal("127.047778"),
            latitude=Decimal("37.517305"),
        )
        self.district2 = District.objects.create(
            province=self.province1,
            name="서초구",
            name_en="Seocho-gu",
            longitude=Decimal("127.032778"),
            latitude=Decimal("37.483569"),
        )
        self.district3 = District.objects.create(
            province=self.province2,
            name="해운대구",
            name_en="Haeundae-gu",
            longitude=Decimal("129.165833"),
            latitude=Decimal("35.163056"),
        )

        # Create an inactive district that should not appear in API results
        self.inactive_district = District.objects.create(
            province=self.province1,
            name="비활성구",
            name_en="Inactive-gu",
            longitude=Decimal("127.000000"),
            latitude=Decimal("37.500000"),
            is_active=False,
        )

    def test_district_list(self):
        url = reverse("district-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # Only active districts

        # Check that the response contains the expected fields
        district_data = response.data[0]
        expected_fields = [
            "id",
            "name",
            "name_en",
            "longitude",
            "latitude",
            "province_name",
            "is_active",
        ]
        for field in expected_fields:
            self.assertIn(field, district_data)

        # Check that province name is included
        district_names = [district["name"] for district in response.data]
        self.assertIn("강남구", district_names)
        self.assertIn("서초구", district_names)
        self.assertIn("해운대구", district_names)
        self.assertNotIn(
            "비활성구", district_names
        )  # Inactive district should not appear

    def test_district_retrieve(self):
        url = reverse("district-detail", kwargs={"pk": self.district1.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the response contains all district fields
        expected_fields = [
            "id",
            "province",
            "name",
            "name_en",
            "longitude",
            "latitude",
            "is_active",
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)

        # Check province data is nested
        self.assertIn("province", response.data)
        self.assertIsInstance(response.data["province"], dict)
        self.assertEqual(response.data["province"]["name"], self.province1.name)

        # Check specific values
        self.assertEqual(response.data["name"], "강남구")
        self.assertEqual(response.data["name_en"], "Gangnam-gu")

    def test_district_retrieve_inactive(self):
        url = reverse("district-detail", kwargs={"pk": self.inactive_district.pk})
        response = self.client.get(url)

        # Should return 404 for inactive districts
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_district_retrieve_nonexistent(self):
        fake_uuid = uuid.uuid4()
        url = reverse("district-detail", kwargs={"pk": fake_uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProvinceAPITest(APITestCase):
    def setUp(self):
        self.province1 = Province.objects.create(
            name="서울특별시", name_en="Seoul Special City"
        )
        self.province2 = Province.objects.create(
            name="부산광역시", name_en="Busan Metropolitan City"
        )

        # Create an inactive province that should not appear in API results
        self.inactive_province = Province.objects.create(
            name="비활성도", name_en="Inactive Province", is_active=False
        )

    def test_province_list(self):
        url = reverse("province-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only active provinces

        # Check province names
        province_names = [province["name"] for province in response.data]
        self.assertIn("서울특별시", province_names)
        self.assertIn("부산광역시", province_names)
        self.assertNotIn(
            "비활성도", province_names
        )  # Inactive province should not appear

    def test_province_retrieve(self):
        url = reverse("province-detail", kwargs={"pk": self.province1.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the response contains all province fields
        expected_fields = ["id", "name", "name_en", "is_active"]
        for field in expected_fields:
            self.assertIn(field, response.data)

        # Check specific values
        self.assertEqual(response.data["name"], "서울특별시")
        self.assertEqual(response.data["name_en"], "Seoul Special City")

    def test_province_retrieve_inactive(self):
        url = reverse("province-detail", kwargs={"pk": self.inactive_province.pk})
        response = self.client.get(url)

        # Should return 404 for inactive provinces
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_province_retrieve_nonexistent(self):
        fake_uuid = uuid.uuid4()
        url = reverse("province-detail", kwargs={"pk": fake_uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
