# Create your tests here.
from django.test import TestCase
from .services import TourismAPIService


class TourismAPIServiceTest(TestCase):
    def setUp(self):
        self.tourism_service = TourismAPIService()

    def test_get_regional_tourism_data(self):
        data = self.tourism_service.get_regional_tourism_data(
            "11", "11530", base_ym="202507", page_no=1, num_of_rows=100
        )
        # API returns actual available items, not necessarily the requested number
        self.assertGreater(len(data), 0)
        self.assertLessEqual(len(data), 100)

    def test_get_related_tourism_data(self):
        data = self.tourism_service.get_related_tourism_data(
            "11", "11530", base_ym="202507", page_no=1, num_of_rows=100
        )
        # API returns actual available items, not necessarily the requested number
        self.assertGreater(len(data), 0)
        self.assertLessEqual(len(data), 100)
