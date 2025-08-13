import uuid
from django.db import models
from django.utils import timezone
from core.models import BaseModel


class TourismPOI(BaseModel):
    """
    한국관광공사 API의 관광지 POI 정보를 저장하는 모델
    기초지자체 중심 관광지 정보 API 응답 데이터 기반
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # API 응답의 핵심 필드들
    hub_tats_cd = models.CharField(
        max_length=255, unique=True, verbose_name="중심지관광지코드"
    )
    hub_tats_nm = models.CharField(max_length=255, verbose_name="중심지관광지명")

    # 위치 정보
    map_x = models.FloatField(verbose_name="X좌표값(경도)")
    map_y = models.FloatField(verbose_name="Y좌표값(위도)")

    # 지역 정보
    area_cd = models.CharField(max_length=10, verbose_name="지역코드")
    area_nm = models.CharField(max_length=100, verbose_name="지역명")
    signgu_cd = models.CharField(max_length=10, verbose_name="시군구코드")
    signgu_nm = models.CharField(max_length=100, verbose_name="시군구명")

    # 카테고리 정보
    hub_ctgry_lcls_nm = models.CharField(
        max_length=100, blank=True, verbose_name="중심지카테고리대분류명"
    )
    hub_ctgry_mcls_nm = models.CharField(
        max_length=100, blank=True, verbose_name="중심지카테고리중분류명"
    )

    # 순위 정보
    hub_rank = models.IntegerField(verbose_name="중심지순위")

    # 기준 연월
    base_ym = models.CharField(max_length=6, verbose_name="기준연월")

    # 추가 메타데이터
    external_url = models.URLField(blank=True, verbose_name="외부 링크")
    phone_number = models.CharField(max_length=20, blank=True, verbose_name="전화번호")
    address = models.TextField(blank=True, verbose_name="주소")

    class Meta:
        db_table = "tourism_poi"
        verbose_name = "관광지 POI"
        verbose_name_plural = "관광지 POI 목록"
        indexes = [
            models.Index(fields=["area_cd", "signgu_cd"]),
            models.Index(fields=["map_x", "map_y"]),
            models.Index(fields=["hub_rank"]),
        ]

    def __str__(self):
        return f"{self.hub_tats_nm} ({self.area_nm} {self.signgu_nm})"


class RelatedTourism(BaseModel):
    """
    관광지별 연관 관광지 정보를 저장하는 모델
    관광지별 연관 관광지 정보 API 응답 데이터 기반
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 기준 관광지 정보
    base_tats_nm = models.CharField(max_length=255, verbose_name="기준관광지명")
    base_area_cd = models.CharField(max_length=10, verbose_name="기준관광지지역코드")
    base_area_nm = models.CharField(
        max_length=100, blank=True, verbose_name="기준관광지지역명"
    )
    base_signgu_cd = models.CharField(
        max_length=10, verbose_name="기준관광지시군구코드"
    )
    base_signgu_nm = models.CharField(
        max_length=100, blank=True, verbose_name="기준관광지시군구명"
    )

    # 연관 관광지 정보
    rite_tats_cd = models.CharField(max_length=255, verbose_name="연관관광지코드")
    rite_tats_nm = models.CharField(max_length=255, verbose_name="연관관광지명")
    rite_regn_cd = models.CharField(max_length=10, verbose_name="연관관광지지역코드")
    rite_regn_nm = models.CharField(
        max_length=100, blank=True, verbose_name="연관관광지지역명"
    )
    rite_signgu_cd = models.CharField(
        max_length=10, verbose_name="연관관광지시군구코드"
    )
    rite_signgu_nm = models.CharField(
        max_length=100, blank=True, verbose_name="연관관광지시군구명"
    )

    # 카테고리 정보
    rite_ctgry_lcls_nm = models.CharField(
        max_length=100, blank=True, verbose_name="연관카테고리대분류명"
    )
    rite_ctgry_mcls_nm = models.CharField(
        max_length=100, blank=True, verbose_name="연관카테고리중분류명"
    )
    rite_ctgry_scls_nm = models.CharField(
        max_length=100, blank=True, verbose_name="연관카테고리소분류명"
    )

    # 순위 정보
    rite_rank = models.IntegerField(verbose_name="연관순위")

    # 기준 연월
    base_ym = models.CharField(max_length=6, verbose_name="기준연월")

    class Meta:
        db_table = "related_tourism"
        verbose_name = "연관 관광지"
        verbose_name_plural = "연관 관광지 목록"
        indexes = [
            models.Index(fields=["base_area_cd", "base_signgu_cd"]),
            models.Index(fields=["rite_rank"]),
            models.Index(fields=["base_tats_nm"]),
        ]
        unique_together = ["base_tats_nm", "rite_tats_cd"]

    def __str__(self):
        return f"{self.base_tats_nm} → {self.rite_tats_nm} (순위: {self.rite_rank})"


class TourismAPICache(BaseModel):
    """
    한국관광공사 API 응답을 캐싱하는 모델
    DB 기반 캐싱으로 시작하여 추후 Redis로 마이그레이션 가능
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 캐시 키 (API 파라미터 기반)
    cache_key = models.CharField(max_length=255, unique=True, verbose_name="캐시 키")

    # 캐시된 데이터
    data = models.JSONField(verbose_name="캐시된 데이터")

    # 만료 시간
    expires_at = models.DateTimeField(verbose_name="만료 시간")

    # API 호출 정보
    api_endpoint = models.CharField(max_length=100, verbose_name="API 엔드포인트")
    request_params = models.JSONField(default=dict, verbose_name="요청 파라미터")

    class Meta:
        db_table = "tourism_api_cache"
        verbose_name = "관광 API 캐시"
        verbose_name_plural = "관광 API 캐시 목록"
        indexes = [
            models.Index(fields=["expires_at"]),
            models.Index(fields=["api_endpoint"]),
        ]

    def __str__(self):
        return f"{self.api_endpoint} - {self.cache_key}"

    @property
    def is_expired(self):
        """캐시가 만료되었는지 확인"""
        return timezone.now() > self.expires_at

    @classmethod
    def cleanup_expired(cls):
        """만료된 캐시 데이터 정리"""
        return cls.objects.filter(expires_at__lt=timezone.now()).delete()


class POIRecommendationCache(BaseModel):
    """
    사용자 위치 기반 POI 추천 결과를 캐싱하는 모델
    추후 Redis 등 캐싱 시스템으로 마이그레이션 가능
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 위치 기반 캐시 키
    cache_key = models.CharField(
        max_length=255, unique=True, verbose_name="추천 캐시 키"
    )

    # 추천 결과
    recommended_pois = models.JSONField(verbose_name="추천된 POI 목록")

    # 추천 기준
    latitude = models.FloatField(verbose_name="위도")
    longitude = models.FloatField(verbose_name="경도")
    radius_km = models.FloatField(default=10.0, verbose_name="추천 반경(km)")

    # 만료 시간
    expires_at = models.DateTimeField(verbose_name="만료 시간")

    class Meta:
        db_table = "poi_recommendation_cache"
        verbose_name = "POI 추천 캐시"
        verbose_name_plural = "POI 추천 캐시 목록"
        indexes = [
            models.Index(fields=["expires_at"]),
            models.Index(fields=["latitude", "longitude"]),
        ]

    def __str__(self):
        return f"추천 캐시 ({self.latitude}, {self.longitude}) - {self.cache_key}"

    @property
    def is_expired(self):
        """캐시가 만료되었는지 확인"""
        return timezone.now() > self.expires_at
