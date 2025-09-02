from django.test import TestCase, override_settings
from unittest.mock import patch, Mock
import requests
from third_party_maps.kakao_service import KakaoMapService


class KakaoMapServiceTests(TestCase):
    """Test cases for KakaoMapService"""

    def setUp(self):
        """Set up test fixtures"""
        self.service = KakaoMapService()
        self.sample_response = {
            "documents": [
                {
                    "id": "123456",
                    "place_name": "Test Restaurant",
                    "category_name": "Food > Korean Food",
                    "phone": "02-123-4567",
                    "address_name": "서울 강남구 테스트동",
                    "road_address_name": "서울 강남구 테스트로 123",
                    "x": "127.027583",
                    "y": "37.497928",
                    "place_url": "http://place.map.kakao.com/123456",
                }
            ],
            "meta": {"total_count": 1, "pageable_count": 1, "is_end": True},
        }

    @override_settings(KAKAO_REST_API_KEY="test_api_key")
    def test_init_with_api_key(self):
        """Test service initialization with API key"""
        service = KakaoMapService()
        self.assertEqual(service.api_key, "test_api_key")

    @override_settings(KAKAO_REST_API_KEY="")
    def test_init_without_api_key_raises_error(self):
        """Test service initialization without API key raises ValueError"""
        with self.assertRaises(ValueError) as context:
            KakaoMapService()
        self.assertIn("KAKAO_API_KEY not found", str(context.exception))

    @patch("third_party_maps.kakao_service.requests.get")
    def test_make_request_success(self, mock_get):
        """Test successful API request"""
        mock_response = Mock()
        mock_response.json.return_value = self.sample_response
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        result = self.service._make_request("keyword.json", {"query": "test"})

        self.assertEqual(result, self.sample_response)
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        self.assertIn("Authorization", kwargs["headers"])
        self.assertTrue(kwargs["headers"]["Authorization"].startswith("KakaoAK"))

    @patch("third_party_maps.kakao_service.requests.get")
    def test_make_request_http_error(self, mock_get):
        """Test API request with HTTP error"""
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("API Error")
        mock_get.return_value = mock_response

        with self.assertRaises(requests.HTTPError):
            self.service._make_request("keyword.json", {"query": "test"})

    @patch("third_party_maps.kakao_service.KakaoMapService._make_request")
    def test_search_by_keyword_basic(self, mock_request):
        """Test basic keyword search"""
        mock_request.return_value = self.sample_response

        result = self.service.search_by_keyword("맛집")

        mock_request.assert_called_once_with(
            "keyword.json", {"query": "맛집", "page": 1, "size": 15, "sort": "accuracy"}
        )
        self.assertEqual(result, self.sample_response)

    @patch("third_party_maps.kakao_service.KakaoMapService._make_request")
    def test_search_by_keyword_with_location(self, mock_request):
        """Test keyword search with location parameters"""
        mock_request.return_value = self.sample_response

        _ = self.service.search_by_keyword(
            query="카페",
            x=127.027583,
            y=37.497928,
            radius=5000,
            page=2,
            size=10,
            sort="distance",
        )

        mock_request.assert_called_once_with(
            "keyword.json",
            {
                "query": "카페",
                "page": 2,
                "size": 10,
                "sort": "distance",
                "x": 127.027583,
                "y": 37.497928,
                "radius": 5000,
            },
        )

    @patch("third_party_maps.kakao_service.KakaoMapService._make_request")
    def test_search_by_keyword_without_location(self, mock_request):
        """Test keyword search without location (x, y not included in params)"""
        mock_request.return_value = self.sample_response

        self.service.search_by_keyword("맛집", x=None, y=37.497928)

        args, kwargs = mock_request.call_args
        params = args[1]
        self.assertNotIn("x", params)
        self.assertNotIn("y", params)
        self.assertNotIn("radius", params)

    @patch("third_party_maps.kakao_service.KakaoMapService._make_request")
    def test_search_by_category(self, mock_request):
        """Test category-based search"""
        mock_request.return_value = self.sample_response

        result = self.service.search_by_category(
            category_group_code="FD6",
            x=127.027583,
            y=37.497928,
            radius=1000,
            page=1,
            size=15,
            sort="distance",
        )

        mock_request.assert_called_once_with(
            "category.json",
            {
                "category_group_code": "FD6",
                "x": 127.027583,
                "y": 37.497928,
                "radius": 1000,
                "page": 1,
                "size": 15,
                "sort": "distance",
            },
        )
        self.assertEqual(result, self.sample_response)

    def test_search_by_keyword_parameter_validation(self):
        """Test parameter validation for keyword search"""
        with patch.object(self.service, "_make_request") as mock_request:
            # Test page boundary
            self.service.search_by_keyword("test", page=45)
            mock_request.assert_called_once()

            # Test size boundary
            mock_request.reset_mock()
            self.service.search_by_keyword("test", size=15)
            mock_request.assert_called_once()

    def test_search_by_category_parameter_validation(self):
        """Test parameter validation for category search"""
        with patch.object(self.service, "_make_request") as mock_request:
            # Test with valid category code
            self.service.search_by_category("MT1", 127.0, 37.0)
            mock_request.assert_called_once()

    @patch("third_party_maps.kakao_service.requests.get")
    def test_api_headers_format(self, mock_get):
        """Test that API headers are correctly formatted"""
        mock_response = Mock()
        mock_response.json.return_value = {}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        self.service._make_request("keyword.json", {"query": "test"})

        args, kwargs = mock_get.call_args
        headers = kwargs["headers"]
        self.assertEqual(headers["Content-Type"], "application/json")
        self.assertTrue(headers["Authorization"].startswith("KakaoAK"))

    def test_get_place_by_id_not_implemented(self):
        """Test that get_place_by_id returns None (not implemented)"""
        result = self.service.get_place_by_id("123456")
        self.assertIsNone(result)

    @patch("third_party_maps.kakao_service.KakaoMapService._make_request")
    def test_empty_search_results(self, mock_request):
        """Test handling of empty search results"""
        empty_response = {
            "documents": [],
            "meta": {"total_count": 0, "pageable_count": 0, "is_end": True},
        }
        mock_request.return_value = empty_response

        result = self.service.search_by_keyword("nonexistent")

        self.assertEqual(result["documents"], [])
        self.assertEqual(result["meta"]["total_count"], 0)

    @patch("third_party_maps.kakao_service.requests.get")
    def test_network_timeout_handling(self, mock_get):
        """Test handling of network timeouts"""
        mock_get.side_effect = requests.Timeout("Request timed out")

        with self.assertRaises(requests.Timeout):
            self.service._make_request("keyword.json", {"query": "test"})
