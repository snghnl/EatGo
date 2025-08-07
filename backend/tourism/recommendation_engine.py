import math
from typing import Dict, List, Optional
from django.utils import timezone
from .models import TourismPOI, POIRecommendationCache


class RecommendationEngine:
    """
    향상된 POI 추천 엔진
    거리, 순위, 카테고리, 인기도를 종합적으로 고려한 점수 기반 추천
    """

    # 가중치 설정
    WEIGHTS = {
        "distance": 0.4,  # 거리 (40%)
        "rank": 0.3,  # 순위 (30%)
        "category": 0.2,  # 카테고리 선호도 (20%)
        "popularity": 0.1,  # 인기도 (10%)
    }

    def __init__(self):
        self.category_weights = {
            "관광지": 1.0,
            "문화시설": 0.8,
            "쇼핑": 0.6,
            "음식점": 0.9,
            "숙박": 0.7,
            "교통": 0.5,
            "레저": 0.8,
            "기타": 0.5,
        }

    def calculate_distance_score(
        self, distance_km: float, max_distance: float = 10.0
    ) -> float:
        """
        거리 기반 점수 계산
        거리가 가까울수록 높은 점수 (0~1)
        """
        if distance_km > max_distance:
            return 0.0

        # 지수 감소 함수 사용 (거리가 멀수록 급격히 감소)
        return math.exp(-distance_km / max_distance)

    def calculate_rank_score(self, rank: int, max_rank: int = 100) -> float:
        """
        순위 기반 점수 계산
        순위가 높을수록(숫자가 작을수록) 높은 점수 (0~1)
        """
        if rank <= 0:
            return 1.0

        # 로그 스케일 사용 (상위 순위에 더 높은 가중치)
        return max(0, 1 - math.log(rank + 1) / math.log(max_rank + 1))

    def calculate_category_score(
        self, category: str, user_preferences: Optional[Dict] = None
    ) -> float:
        """
        카테고리 선호도 점수 계산
        """
        if not user_preferences:
            # 기본 카테고리 가중치 사용
            return self.category_weights.get(category, 0.5)

        # 사용자 선호도 반영
        return user_preferences.get(category, 0.5)

    def calculate_popularity_score(self, poi: Dict) -> float:
        """
        인기도 점수 계산 (현재는 기본값, 추후 방문자 수 등으로 확장)
        """
        # TODO: 실제 방문자 수, 리뷰 수 등을 기반으로 계산
        # 현재는 순위를 기반으로 한 간단한 계산
        rank = poi.get("hub_rank", 50)
        return max(0, 1 - (rank - 1) / 100)

    def calculate_poi_score(
        self, poi: Dict, user_location: Dict, user_preferences: Optional[Dict] = None
    ) -> float:
        """
        POI 종합 점수 계산
        """
        # 거리 계산
        distance = self._calculate_distance(
            user_location["latitude"],
            user_location["longitude"],
            poi["map_y"],
            poi["map_x"],
        )

        # 각 항목별 점수 계산
        distance_score = self.calculate_distance_score(distance)
        rank_score = self.calculate_rank_score(poi.get("hub_rank", 50))
        category_score = self.calculate_category_score(
            poi.get("hub_ctgry_mcls_nm", ""), user_preferences
        )
        popularity_score = self.calculate_popularity_score(poi)

        # 가중 평균 계산
        total_score = (
            distance_score * self.WEIGHTS["distance"]
            + rank_score * self.WEIGHTS["rank"]
            + category_score * self.WEIGHTS["category"]
            + popularity_score * self.WEIGHTS["popularity"]
        )

        return total_score

    def _calculate_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """두 지점 간의 거리 계산 (Haversine 공식)"""
        # 위도, 경도를 라디안으로 변환
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine 공식
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        r = 6371  # 지구의 반지름 (km)

        return c * r

    def get_recommended_pois(
        self,
        user_location: Dict,
        radius_km: float = 10.0,
        user_preferences: Optional[Dict] = None,
        max_results: int = 20,
    ) -> List[Dict]:
        """
        향상된 POI 추천

        Args:
            user_location: 사용자 위치 {'latitude': float, 'longitude': float}
            radius_km: 추천 반경
            user_preferences: 사용자 카테고리 선호도
            max_results: 최대 추천 개수

        Returns:
            추천된 POI 리스트 (점수순 정렬)
        """
        # 캐시 확인
        cache_key = f"enhanced_recommendation:{user_location['latitude']:.4f}:{user_location['longitude']:.4f}:{radius_km}"

        try:
            cache_obj = POIRecommendationCache.objects.get(
                cache_key=cache_key, expires_at__gt=timezone.now()
            )
            return cache_obj.recommended_pois
        except POIRecommendationCache.DoesNotExist:
            pass

        # DB에서 POI 조회 (반경 내)
        pois = self._get_pois_within_radius(
            user_location["latitude"], user_location["longitude"], radius_km
        )

        # 각 POI에 점수 계산
        scored_pois = []
        for poi in pois:
            score = self.calculate_poi_score(poi, user_location, user_preferences)

            scored_pois.append(
                {
                    "id": poi["hub_tats_cd"],
                    "name": poi["hub_tats_nm"],
                    "latitude": poi["map_y"],
                    "longitude": poi["map_x"],
                    "distance": self._calculate_distance(
                        user_location["latitude"],
                        user_location["longitude"],
                        poi["map_y"],
                        poi["map_x"],
                    ),
                    "category": poi.get("hub_ctgry_mcls_nm", ""),
                    "area": poi.get("area_nm", ""),
                    "rank": poi.get("hub_rank", 0),
                    "score": round(score, 3),
                    "score_breakdown": {
                        "distance": round(
                            self.calculate_distance_score(
                                self._calculate_distance(
                                    user_location["latitude"],
                                    user_location["longitude"],
                                    poi["map_y"],
                                    poi["map_x"],
                                )
                            ),
                            3,
                        ),
                        "rank": round(
                            self.calculate_rank_score(poi.get("hub_rank", 50)), 3
                        ),
                        "category": round(
                            self.calculate_category_score(
                                poi.get("hub_ctgry_mcls_nm", ""), user_preferences
                            ),
                            3,
                        ),
                        "popularity": round(self.calculate_popularity_score(poi), 3),
                    },
                }
            )

        # 점수순으로 정렬
        scored_pois.sort(key=lambda x: x["score"], reverse=True)

        # 최대 결과 수 제한
        recommended_pois = scored_pois[:max_results]

        # 캐시 저장
        from datetime import timedelta

        expires_at = timezone.now() + timedelta(hours=6)
        POIRecommendationCache.objects.create(
            cache_key=cache_key,
            recommended_pois=recommended_pois,
            latitude=user_location["latitude"],
            longitude=user_location["longitude"],
            radius_km=radius_km,
            expires_at=expires_at,
        )

        return recommended_pois

    def _get_pois_within_radius(
        self, lat: float, lon: float, radius_km: float
    ) -> List[Dict]:
        """
        반경 내 POI 조회 (간단한 구현)
        실제로는 PostGIS나 공간 인덱스를 사용해야 함
        """
        # TODO: 공간 쿼리로 최적화 필요
        all_pois = TourismPOI.objects.all()

        pois_within_radius = []
        for poi in all_pois:
            distance = self._calculate_distance(lat, lon, poi.map_y, poi.map_x)
            if distance <= radius_km:
                pois_within_radius.append(
                    {
                        "hub_tats_cd": poi.hub_tats_cd,
                        "hub_tats_nm": poi.hub_tats_nm,
                        "map_x": poi.map_x,
                        "map_y": poi.map_y,
                        "area_nm": poi.area_nm,
                        "signgu_nm": poi.signgu_nm,
                        "hub_ctgry_lcls_nm": poi.hub_ctgry_lcls_nm,
                        "hub_ctgry_mcls_nm": poi.hub_ctgry_mcls_nm,
                        "hub_rank": poi.hub_rank,
                    }
                )

        return pois_within_radius


class UserPreferenceService:
    """
    사용자 선호도 관리 서비스
    """

    def __init__(self):
        self.default_preferences = {
            "관광지": 0.8,
            "문화시설": 0.7,
            "쇼핑": 0.6,
            "음식점": 0.9,
            "숙박": 0.5,
            "교통": 0.4,
            "레저": 0.8,
            "기타": 0.5,
        }

    def get_user_preferences(self, user_id: Optional[str] = None) -> Dict[str, float]:
        """
        사용자 선호도 조회
        TODO: 실제 사용자 선호도 DB에서 조회
        """
        # 현재는 기본 선호도 반환
        return self.default_preferences.copy()

    def update_user_preference(self, user_id: str, category: str, rating: float):
        """
        사용자 선호도 업데이트
        TODO: 실제 DB에 저장
        """
        # 사용자가 특정 카테고리 POI를 평가할 때 호출
        pass

    def learn_from_user_behavior(self, user_id: str, poi_id: str, action: str):
        """
        사용자 행동 기반 선호도 학습
        action: 'view', 'like', 'visit', 'share' 등
        """
        # TODO: 사용자 행동 분석을 통한 선호도 학습
        pass
