from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import (
    TourismPOI,
    RelatedTourism,
    TourismAPICache,
    POIRecommendationCache,
)
from .services import TourismAPIService
from .recommendation_engine import RecommendationEngine


class TourismAPIServiceUnitTests(TestCase):
    def test_init_without_service_key_raises(self):
        with override_settings(TOURISM_API_SERVICE_KEY=""):
            with self.assertRaises(ValueError):
                TourismAPIService()

    @override_settings(TOURISM_API_SERVICE_KEY="test-key")
    @patch("tourism.services.requests.get")
    def test_get_regional_tourism_data_saves_cache_and_pois(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "response": {
                "header": {"resultCode": "0000", "resultMsg": "OK"},
                "body": {
                    "items": {
                        "item": [
                            {
                                "hubTatsCd": "HUB001",
                                "hubTatsNm": "서울숲",
                                "mapX": 127.04,
                                "mapY": 37.54,
                                "areaCd": "11",
                                "areaNm": "서울",
                                "signguCd": "11530",
                                "signguNm": "구로구",
                                "hubCtgryLclsNm": "관광지",
                                "hubCtgryMclsNm": "공원",
                                "hubRank": 1,
                                "baseYm": "202507",
                            }
                        ]
                    }
                },
            }
        }
        mock_get.return_value = mock_response

        service = TourismAPIService()
        items = service.get_regional_tourism_data(
            area_cd="11", signgu_cd="11530", base_ym="202507", page_no=1, num_of_rows=10
        )

        self.assertEqual(len(items), 1)
        self.assertEqual(TourismPOI.objects.count(), 1)
        poi = TourismPOI.objects.first()
        self.assertEqual(poi.hub_tats_cd, "HUB001")
        self.assertEqual(TourismAPICache.objects.count(), 1)

    @override_settings(TOURISM_API_SERVICE_KEY="test-key")
    def test_get_regional_tourism_data_uses_cache(self):
        service = TourismAPIService()
        params = {
            "areaCd": "11",
            "signguCd": "11530",
            "baseYm": "202507",
            "numOfRows": 10,
            "pageNo": 1,
        }
        cache_key = service._generate_cache_key("regional_tourism", params)
        TourismAPICache.objects.create(
            cache_key=cache_key,
            data={
                "response": {
                    "header": {"resultCode": "0000"},
                    "body": {"items": {"item": [{"hubTatsCd": "CACHED"}]}},
                }
            },
            expires_at=timezone.now() + timedelta(hours=1),
            api_endpoint="regional_tourism",
            request_params=params,
        )

        with patch("tourism.services.requests.get") as mock_get:
            items = service.get_regional_tourism_data(
                area_cd="11",
                signgu_cd="11530",
                base_ym="202507",
                page_no=1,
                num_of_rows=10,
            )
            mock_get.assert_not_called()
            self.assertEqual(items[0]["hubTatsCd"], "CACHED")

    @override_settings(TOURISM_API_SERVICE_KEY="test-key")
    @patch("tourism.services.requests.get")
    def test_get_related_tourism_data_saves_related(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "response": {
                "header": {"resultCode": "0000", "resultMsg": "OK"},
                "body": {
                    "items": {
                        "item": [
                            {
                                "tAtsNm": "서울숲",
                                "areaCd": "11",
                                "areaNm": "서울",
                                "signguCd": "11530",
                                "signguNm": "구로구",
                                "rlteTatsCd": "REL001",
                                "rlteTatsNm": "한강공원",
                                "rlteRegnCd": "11",
                                "rlteRegnNm": "서울",
                                "rlteSignguCd": "11110",
                                "rlteSignguNm": "종로구",
                                "rlteCtgryLclsNm": "관광지",
                                "rlteCtgryMclsNm": "공원",
                                "rlteCtgrySclsNm": "강변",
                                "rlteRank": 3,
                                "baseYm": "202507",
                            }
                        ]
                    }
                },
            }
        }
        mock_get.return_value = mock_response

        service = TourismAPIService()
        items = service.get_related_tourism_data(
            area_cd="11", signgu_cd="11530", base_ym="202507", page_no=1, num_of_rows=10
        )

        self.assertEqual(len(items), 1)
        self.assertEqual(RelatedTourism.objects.count(), 1)
        rel = RelatedTourism.objects.first()
        self.assertEqual(rel.rite_tats_cd, "REL001")


class RecommendationEngineUnitTests(TestCase):
    def setUp(self):
        self.engine = RecommendationEngine()

    def test_distance_score_bounds(self):
        self.assertEqual(
            self.engine.calculate_distance_score(100.0, max_distance=10.0), 0.0
        )
        near = self.engine.calculate_distance_score(0.0, max_distance=10.0)
        self.assertAlmostEqual(near, 1.0, places=5)

    def test_rank_score_monotonic(self):
        higher = self.engine.calculate_rank_score(1)
        lower = self.engine.calculate_rank_score(50)
        self.assertGreater(higher, lower)

    def test_category_score_default_and_user_pref(self):
        default = self.engine.calculate_category_score("관광지")
        self.assertGreater(default, 0.0)
        user_pref = self.engine.calculate_category_score("관광지", {"관광지": 0.2})
        self.assertEqual(user_pref, 0.2)

    def test_get_recommended_pois_within_radius_and_sorted(self):
        # Create POIs around a central point (Seoul City Hall approx: 37.5665, 126.9780)
        base_lat, base_lon = 37.5665, 126.9780
        poi_specs = [
            (
                "P1",
                "POI-NEAR",
                base_lon + 0.01,
                base_lat + 0.01,
                1,
            ),  # very near, high rank
            ("P2", "POI-FAR", base_lon + 0.3, base_lat + 0.3, 10),  # far, lower score
            ("P3", "POI-MID", base_lon + 0.05, base_lat + 0.05, 5),
        ]
        for code, name, map_x, map_y, rank in poi_specs:
            TourismPOI.objects.create(
                hub_tats_cd=code,
                hub_tats_nm=name,
                map_x=map_x,
                map_y=map_y,
                area_cd="11",
                area_nm="서울",
                signgu_cd="11110",
                signgu_nm="종로구",
                hub_ctgry_lcls_nm="관광지",
                hub_ctgry_mcls_nm="공원",
                hub_rank=rank,
                base_ym="202507",
            )

        results = self.engine.get_recommended_pois(
            user_location={"latitude": base_lat, "longitude": base_lon},
            radius_km=20.0,
            user_preferences=None,
            max_results=10,
        )
        self.assertGreaterEqual(len(results), 2)
        # Ensure sorted by score desc
        scores = [r["score"] for r in results]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_get_recommended_pois_uses_cache(self):
        user_location = {"latitude": 37.5, "longitude": 127.0}
        radius_km = 10.0
        cache_key = f"enhanced_recommendation:{user_location['latitude']:.4f}:{user_location['longitude']:.4f}:{radius_km}"
        cached_payload = [
            {
                "id": "CACHED1",
                "name": "캐시된 관광지",
                "latitude": 37.5,
                "longitude": 127.0,
                "distance": 0.0,
                "category": "공원",
                "area": "서울",
                "rank": 1,
                "score": 0.99,
            }
        ]
        POIRecommendationCache.objects.create(
            cache_key=cache_key,
            recommended_pois=cached_payload,
            latitude=user_location["latitude"],
            longitude=user_location["longitude"],
            radius_km=radius_km,
            expires_at=timezone.now() + timedelta(hours=1),
        )

        results = self.engine.get_recommended_pois(
            user_location=user_location,
            radius_km=radius_km,
            user_preferences=None,
            max_results=10,
        )
        self.assertEqual(results, cached_payload)


class SerializerValidationTests(TestCase):
    def test_poi_recommendation_request_serializer_validation(self):
        from .serializers import POIRecommendationRequestSerializer

        serializer = POIRecommendationRequestSerializer(
            data={
                "latitude": 95.0,
                "longitude": 10.0,
                "radius_km": 10.0,
                "max_results": 5,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("latitude", serializer.errors)

        serializer = POIRecommendationRequestSerializer(
            data={
                "latitude": 37.0,
                "longitude": 181.0,
                "radius_km": 10.0,
                "max_results": 5,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("longitude", serializer.errors)

        serializer = POIRecommendationRequestSerializer(
            data={
                "latitude": 37.0,
                "longitude": 127.0,
                "radius_km": 0.01,
                "max_results": 0,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("radius_km", serializer.errors)
        self.assertIn("max_results", serializer.errors)


class ModelUtilityTests(TestCase):
    def test_api_cache_is_expired_and_cleanup(self):
        valid = TourismAPICache.objects.create(
            cache_key="k1",
            data={"response": {}},
            expires_at=timezone.now() + timedelta(hours=1),
            api_endpoint="ep",
            request_params={},
        )
        expired = TourismAPICache.objects.create(
            cache_key="k2",
            data={"response": {}},
            expires_at=timezone.now() - timedelta(hours=1),
            api_endpoint="ep",
            request_params={},
        )
        self.assertFalse(valid.is_expired)
        self.assertTrue(expired.is_expired)
        deleted_count, _ = TourismAPICache.cleanup_expired()
        self.assertGreaterEqual(deleted_count, 1)
        self.assertTrue(TourismAPICache.objects.filter(cache_key="k1").exists())
        self.assertFalse(TourismAPICache.objects.filter(cache_key="k2").exists())


class TourismAPITests(APITestCase):
    @override_settings(TOURISM_API_SERVICE_KEY="test-key")
    @patch.object(TourismAPIService, "get_regional_tourism_data")
    def test_regional_endpoint_success(self, mock_service: MagicMock):
        mock_service.return_value = [
            {
                "hubTatsCd": "HUB001",
                "hubTatsNm": "서울숲",
                "mapX": 127.04,
                "mapY": 37.54,
                "hubRank": 1,
            },
            {
                "hubTatsCd": "HUB002",
                "hubTatsNm": "한강공원",
                "mapX": 127.02,
                "mapY": 37.53,
                "hubRank": 2,
            },
        ]

        payload = {"area_cd": "11", "signgu_cd": "11530", "base_ym": "202507"}
        resp = self.client.post("/api/tourism/api/regional/", payload, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["success"])
        self.assertEqual(resp.data["count"], 2)

    def test_regional_endpoint_validation_error(self):
        # Missing required fields
        resp = self.client.post("/api/tourism/api/regional/", {}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data["success"])

    @patch("tourism.views.POIRecommendationService")
    def test_recommendation_endpoint_success(self, mock_service_cls: MagicMock):
        mock_service = MagicMock()
        mock_service.get_recommended_pois.return_value = [
            {
                "id": "HUB001",
                "name": "서울숲",
                "latitude": 37.54,
                "longitude": 127.04,
                "distance": 1.2,
                "category": "공원",
                "area": "서울",
                "rank": 1,
            }
        ]
        mock_service_cls.return_value = mock_service

        payload = {
            "latitude": 37.5,
            "longitude": 127.0,
            "radius_km": 10.0,
            "max_results": 5,
        }
        resp = self.client.post(
            "/tourism/recommendation/recommend/", payload, format="json"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["success"])
        self.assertEqual(resp.data["count"], 1)

    def test_recommendation_endpoint_validation_error(self):
        resp = self.client.post(
            "/api/tourism/recommendation/recommend/",
            {"latitude": 100.0, "longitude": 200.0},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data["success"])

    @patch("tourism.views.POIRecommendationService")
    def test_related_endpoint_success(self, mock_service_cls: MagicMock):
        mock_service = MagicMock()
        mock_service.get_related_pois.return_value = [
            {
                "id": "REL001",
                "name": "한강공원",
                "category": "공원",
                "area": "서울",
                "rank": 3,
            }
        ]
        mock_service_cls.return_value = mock_service

        payload = {"poi_name": "서울숲", "area_cd": "11", "signgu_cd": "11530"}
        resp = self.client.post(
            "/api/tourism/recommendation/related/", payload, format="json"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["success"])
        self.assertEqual(resp.data["count"], 1)

    def test_related_endpoint_validation_error(self):
        resp = self.client.post(
            "/api/tourism/recommendation/related/",
            {"poi_name": "서울숲"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data["success"])
