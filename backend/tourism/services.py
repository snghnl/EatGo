import requests
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.utils import timezone
from .models import TourismPOI, RelatedTourism, TourismAPICache


class TourismAPIService:
    """
    한국관광공사 API 연동 서비스
    기초지자체 중심 관광지 정보 및 관광지별 연관 관광지 정보 API 호출
    """

    # API 기본 설정
    BASE_URL = "http://apis.data.go.kr/B551011"
    API_ENDPOINTS = {
        "regional_tourism": "/LocgoHubTarService1/areaBasedList1",  # 기초지자체 중심 관광지 정보
        "related_tourism": "/TarRlteTarService1/areaBasedList1",  # 관광지별 연관 관광지 정보
    }

    def __init__(self):
        self.service_key = getattr(settings, "TOURISM_API_SERVICE_KEY", "")
        if not self.service_key:
            raise ValueError("TOURISM_API_SERVICE_KEY가 설정되지 않았습니다.")

    def _generate_cache_key(self, endpoint: str, params: Dict) -> str:
        """API 파라미터를 기반으로 캐시 키 생성"""
        param_str = json.dumps(params, sort_keys=True)
        return hashlib.md5(f"{endpoint}:{param_str}".encode()).hexdigest()

    def _get_cached_data(self, cache_key: str) -> Optional[Dict]:
        """캐시에서 데이터 조회"""
        try:
            cache_obj = TourismAPICache.objects.get(
                cache_key=cache_key, expires_at__gt=timezone.now()
            )
            return cache_obj.data
        except TourismAPICache.DoesNotExist:
            return None

    def _save_cache_data(
        self,
        cache_key: str,
        data: Dict,
        endpoint: str,
        params: Dict,
        ttl_hours: int = 24,
    ):
        """데이터를 캐시에 저장"""
        expires_at = timezone.now() + timedelta(hours=ttl_hours)

        TourismAPICache.objects.update_or_create(
            cache_key=cache_key,
            defaults={
                "data": data,
                "expires_at": expires_at,
                "api_endpoint": endpoint,
                "request_params": params,
            },
        )

    def _call_api(self, endpoint: str, params: Dict) -> Dict:
        """한국관광공사 API 호출"""
        url = f"{self.BASE_URL}{endpoint}"

        # 필수 파라미터 추가
        api_params = {
            "serviceKey": self.service_key,
            "MobileOS": "ETC",
            "MobileApp": "EatGo",
            "_type": "json",
            **params,
        }

        try:
            response = requests.get(url, params=api_params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # API 응답 검증
            if data.get("response", {}).get("header", {}).get("resultCode") != "0000":
                error_msg = (
                    data.get("response", {})
                    .get("header", {})
                    .get("resultMsg", "Unknown error")
                )
                raise Exception(f"API 호출 실패: {error_msg}")

            return data

        except requests.RequestException as e:
            raise Exception(f"API 호출 중 오류 발생: {str(e)}")

    def get_regional_tourism_data(
        self,
        area_cd: str,
        signgu_cd: str,
        base_ym: str = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> List[Dict]:
        """
        기초지자체 중심 관광지 정보 조회

        Args:
            area_cd: 지역코드 (예: '11' for 서울)
            signgu_cd: 시군구코드 (예: '11530' for 구로구)
            base_ym: 기준연월 (YYYYMM 형식, 기본값: 현재월)
            page_no: 페이지 번호 (기본값: 1)
            num_of_rows: 한 번에 가져올 데이터 수 (기본값: 100)

        Returns:
            관광지 정보 리스트
        """
        if base_ym is None:
            base_ym = datetime.now().strftime("%Y%m")

        params = {
            "areaCd": area_cd,
            "signguCd": signgu_cd,
            "baseYm": base_ym,
            "numOfRows": num_of_rows,  # 한 번에 가져올 데이터 수
            "pageNo": page_no,
        }

        cache_key = self._generate_cache_key("regional_tourism", params)

        # 캐시 확인
        cached_data = self._get_cached_data(cache_key)
        if cached_data:
            items_data = (
                cached_data.get("response", {}).get("body", {}).get("items", {})
            )
            return (
                items_data.get("item", [])
                if isinstance(items_data, dict)
                else items_data
            )

        # API 호출
        api_data = self._call_api(self.API_ENDPOINTS["regional_tourism"], params)

        # 캐시 저장
        self._save_cache_data(cache_key, api_data, "regional_tourism", params)

        # DB에 POI 정보 저장
        items_data = api_data.get("response", {}).get("body", {}).get("items", {})
        items_list = (
            items_data.get("item", []) if isinstance(items_data, dict) else items_data
        )

        self._save_pois_to_db(items_list)

        return items_list

    def get_related_tourism_data(
        self,
        area_cd: str,
        signgu_cd: str,
        base_ym: str = None,
        page_no: int = 1,
        num_of_rows: int = 50,
    ) -> List[Dict]:
        """
        관광지별 연관 관광지 정보 조회

        Args:
            area_cd: 지역코드
            signgu_cd: 시군구코드
            base_ym: 기준연월 (YYYYMM 형식, 기본값: 현재월)
            page_no: 페이지 번호 (기본값: 1)
            num_of_rows: 한 번에 가져올 데이터 수 (기본값: 50)

        Returns:
            연관 관광지 정보 리스트
        """
        if base_ym is None:
            base_ym = datetime.now().strftime("%Y%m")

        params = {
            "areaCd": area_cd,
            "signguCd": signgu_cd,
            "baseYm": base_ym,
            "numOfRows": num_of_rows,
            "pageNo": page_no,
        }

        cache_key = self._generate_cache_key("related_tourism", params)

        # 캐시 확인
        cached_data = self._get_cached_data(cache_key)
        if cached_data:
            items_data = (
                cached_data.get("response", {}).get("body", {}).get("items", {})
            )
            return (
                items_data.get("item", [])
                if isinstance(items_data, dict)
                else items_data
            )

        # API 호출
        api_data = self._call_api(self.API_ENDPOINTS["related_tourism"], params)

        # 캐시 저장
        self._save_cache_data(cache_key, api_data, "related_tourism", params)

        # DB에 연관 관광지 정보 저장
        items_data = api_data.get("response", {}).get("body", {}).get("items", {})
        items_list = (
            items_data.get("item", []) if isinstance(items_data, dict) else items_data
        )

        self._save_related_tourism_to_db(items_list)

        return items_list

    def _save_pois_to_db(self, items: List[Dict]):
        """API 응답의 POI 정보를 DB에 저장"""
        for item in items:
            try:
                TourismPOI.objects.update_or_create(
                    hub_tats_cd=item.get("hubTatsCd"),
                    defaults={
                        "map_x": float(item.get("mapX", 0)),
                        "map_y": float(item.get("mapY", 0)),
                        "area_cd": item.get("areaCd", ""),
                        "area_nm": item.get("areaNm", ""),
                        "signgu_cd": item.get("signguCd", ""),
                        "signgu_nm": item.get("signguNm", ""),
                        "hub_ctgry_lcls_nm": item.get("hubCtgryLclsNm", ""),
                        "hub_ctgry_mcls_nm": item.get("hubCtgryMclsNm", ""),
                        "hub_rank": int(item.get("hubRank", 0)),
                        "base_ym": item.get("baseYm", ""),
                    },
                )
            except (ValueError, TypeError) as e:
                # 데이터 변환 오류 시 로그 기록 (실제로는 로깅 시스템 사용)
                print(f"POI 데이터 저장 오류: {e}, 데이터: {item}")

    def _save_related_tourism_to_db(self, items: List[Dict]):
        """API 응답의 연관 관광지 정보를 DB에 저장"""
        for item in items:
            try:
                # 필수 필드가 없으면 건너뛰기
                if not item.get("rlteTatsCd"):
                    continue

                RelatedTourism.objects.update_or_create(
                    rite_tats_cd=item.get("rlteTatsCd"),
                    defaults={
                        "base_tats_nm": item.get("tAtsNm", ""),
                        "base_area_cd": item.get("areaCd", ""),
                        "base_area_nm": item.get("areaNm", ""),
                        "base_signgu_cd": item.get("signguCd", ""),
                        "base_signgu_nm": item.get("signguNm", ""),
                        "rite_tats_nm": item.get("rlteTatsNm", ""),
                        "rite_regn_cd": item.get("rlteRegnCd", ""),
                        "rite_regn_nm": item.get("rlteRegnNm", ""),
                        "rite_signgu_cd": item.get("rlteSignguCd", ""),
                        "rite_signgu_nm": item.get("rlteSignguNm", ""),
                        "rite_ctgry_lcls_nm": item.get("rlteCtgryLclsNm", ""),
                        "rite_ctgry_mcls_nm": item.get("rlteCtgryMclsNm", ""),
                        "rite_ctgry_scls_nm": item.get("rlteCtgrySclsNm", ""),
                        "rite_rank": int(item.get("rlteRank", 0)),
                        "base_ym": item.get("baseYm", ""),
                    },
                )
            except (ValueError, TypeError) as e:
                print(f"연관 관광지 데이터 저장 오류: {e}, 데이터: {item}")


class POIRecommendationService:
    """
    사용자 위치 기반 POI 추천 서비스
    """

    def __init__(self):
        self.tourism_service = TourismAPIService()
        from .recommendation_engine import RecommendationEngine, UserPreferenceService

        self.recommendation_engine = RecommendationEngine()
        self.user_preference_service = UserPreferenceService()

    def _calculate_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """두 지점 간의 거리 계산 (Haversine 공식)"""
        from math import radians, cos, sin, asin, sqrt

        # 위도, 경도를 라디안으로 변환
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

        # Haversine 공식
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        r = 6371  # 지구의 반지름 (km)

        return c * r

    def _get_area_codes_by_location(
        self, latitude: float, longitude: float
    ) -> List[Tuple[str, str]]:
        """
        위도/경도를 기반으로 지역코드 조회
        실제로는 좌표-지역 매핑 API나 DB를 사용해야 함
        현재는 서울 지역만 반환하는 예시
        """
        # TODO: 실제 좌표-지역 매핑 로직 구현 필요
        # 현재는 서울 지역만 반환
        return [("11", "11530")]  # 서울 구로구

    def get_recommended_pois(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        user_id: Optional[str] = None,
        max_results: int = 20,
    ) -> List[Dict]:
        """
        사용자 위치 기반 POI 추천 (향상된 알고리즘)

        Args:
            latitude: 사용자 위도
            longitude: 사용자 경도
            radius_km: 추천 반경 (km)
            user_id: 사용자 ID (선호도 반영용)
            max_results: 최대 추천 개수

        Returns:
            추천된 POI 리스트 (점수순 정렬)
        """
        # 사용자 선호도 조회
        user_preferences = self.user_preference_service.get_user_preferences(user_id)

        # 향상된 추천 엔진 사용
        user_location = {"latitude": latitude, "longitude": longitude}

        return self.recommendation_engine.get_recommended_pois(
            user_location=user_location,
            radius_km=radius_km,
            user_preferences=user_preferences,
            max_results=max_results,
        )

    def get_related_pois(
        self, poi_name: str, area_cd: str, signgu_cd: str
    ) -> List[Dict]:
        """
        특정 POI의 연관 관광지 조회

        Args:
            poi_name: 관광지명
            area_cd: 지역코드
            signgu_cd: 시군구코드

        Returns:
            연관 관광지 리스트
        """
        try:
            # get_related_tourism_data는 area_cd, signgu_cd, base_ym, page_no, num_of_rows를 받음
            # poi_name은 현재 API에서 지원하지 않으므로 area_cd와 signgu_cd만 사용
            related_data = self.tourism_service.get_related_tourism_data(
                area_cd, signgu_cd
            )

            related_pois = []
            for poi in related_data:
                related_pois.append(
                    {
                        "id": poi.get("riteTatsCd"),
                        "name": poi.get("riteTatsNm"),
                        "category": poi.get("riteCtgryMclsNm", ""),
                        "area": poi.get("riteRegnNm", ""),
                        "rank": int(poi.get("riteRank", 0)),
                    }
                )

            return related_pois

        except Exception as e:
            print(f"연관 관광지 조회 중 오류: {e}")
            return []


if __name__ == "__main__":
    tourism_service = TourismAPIService()
    print(tourism_service.get_regional_tourism_data("11", "11530"))
    print(tourism_service.get_related_tourism_data("11", "11530"))
