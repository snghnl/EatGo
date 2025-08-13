from rest_framework import serializers
from .models import TourismPOI, RelatedTourism


class TourismPOISerializer(serializers.ModelSerializer):
    """관광지 POI 정보 시리얼라이저"""

    class Meta:
        model = TourismPOI
        fields = [
            "id",
            "hub_tats_cd",
            "hub_tats_nm",
            "map_x",
            "map_y",
            "area_cd",
            "area_nm",
            "signgu_cd",
            "signgu_nm",
            "hub_ctgry_lcls_nm",
            "hub_ctgry_mcls_nm",
            "hub_rank",
            "external_url",
            "phone_number",
            "address",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class RelatedTourismSerializer(serializers.ModelSerializer):
    """연관 관광지 정보 시리얼라이저"""

    class Meta:
        model = RelatedTourism
        fields = [
            "id",
            "base_tats_nm",
            "base_area_cd",
            "base_area_nm",
            "rite_tats_cd",
            "rite_tats_nm",
            "rite_regn_cd",
            "rite_regn_nm",
            "rite_ctgry_lcls_nm",
            "rite_ctgry_mcls_nm",
            "rite_rank",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class POIRecommendationRequestSerializer(serializers.Serializer):
    """POI 추천 요청 시리얼라이저"""

    latitude = serializers.FloatField(
        min_value=-90.0, max_value=90.0, help_text="사용자 위도 (-90 ~ 90)"
    )
    longitude = serializers.FloatField(
        min_value=-180.0, max_value=180.0, help_text="사용자 경도 (-180 ~ 180)"
    )
    radius_km = serializers.FloatField(
        min_value=0.1,
        max_value=50.0,
        default=10.0,
        help_text="추천 반경 (km, 기본값: 10.0)",
    )
    max_results = serializers.IntegerField(
        min_value=1, max_value=100, default=20, help_text="최대 추천 개수 (기본값: 20)"
    )


class POIRecommendationResponseSerializer(serializers.Serializer):
    """POI 추천 응답 시리얼라이저"""

    id = serializers.CharField(help_text="관광지 ID")
    name = serializers.CharField(help_text="관광지명")
    latitude = serializers.FloatField(help_text="위도")
    longitude = serializers.FloatField(help_text="경도")
    distance = serializers.FloatField(help_text="사용자로부터의 거리 (km)")
    category = serializers.CharField(help_text="카테고리")
    area = serializers.CharField(help_text="지역명")
    rank = serializers.IntegerField(help_text="순위")


class RelatedPOIRequestSerializer(serializers.Serializer):
    """연관 POI 조회 요청 시리얼라이저"""

    poi_name = serializers.CharField(help_text="관광지명")
    area_cd = serializers.CharField(help_text="지역코드")
    signgu_cd = serializers.CharField(help_text="시군구코드")


class RelatedPOIResponseSerializer(serializers.Serializer):
    """연관 POI 응답 시리얼라이저"""

    id = serializers.CharField(help_text="연관 관광지 ID")
    name = serializers.CharField(help_text="연관 관광지명")
    category = serializers.CharField(help_text="카테고리")
    area = serializers.CharField(help_text="지역명")
    rank = serializers.IntegerField(help_text="순위")


class RegionalTourismRequestSerializer(serializers.Serializer):
    """지역 관광지 조회 요청 시리얼라이저"""

    area_cd = serializers.CharField(help_text="지역코드 (예: '11' for 서울)")
    signgu_cd = serializers.CharField(help_text="시군구코드 (예: '11530' for 구로구)")
    base_ym = serializers.CharField(
        required=False, help_text="기준연월 (YYYYMM 형식, 기본값: 현재월)"
    )
    num_of_rows = serializers.IntegerField(
        min_value=1,
        max_value=100,
        default=20,
        help_text="한 페이지 결과 수 (기본값: 20)",
    )
    page_no = serializers.IntegerField(
        min_value=1, default=1, help_text="페이지 번호 (기본값: 1)"
    )
