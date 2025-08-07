from django.contrib import admin
from .models import TourismPOI, RelatedTourism, TourismAPICache, POIRecommendationCache


@admin.register(TourismPOI)
class TourismPOIAdmin(admin.ModelAdmin):
    list_display = [
        "hub_tats_nm",
        "area_nm",
        "signgu_nm",
        "hub_rank",
        "map_x",
        "map_y",
        "created_at",
    ]
    list_filter = ["area_cd", "signgu_cd", "hub_ctgry_lcls_nm", "hub_rank"]
    search_fields = ["hub_tats_nm", "area_nm", "signgu_nm"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["hub_rank", "hub_tats_nm"]

    fieldsets = (
        ("기본 정보", {"fields": ("hub_tats_cd", "hub_tats_nm", "hub_rank")}),
        ("위치 정보", {"fields": ("map_x", "map_y", "address")}),
        ("지역 정보", {"fields": ("area_cd", "area_nm", "signgu_cd", "signgu_nm")}),
        ("카테고리 정보", {"fields": ("hub_ctgry_lcls_nm", "hub_ctgry_mcls_nm")}),
        ("기타 정보", {"fields": ("base_ym", "external_url", "phone_number")}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(RelatedTourism)
class RelatedTourismAdmin(admin.ModelAdmin):
    list_display = [
        "base_tats_nm",
        "rite_tats_nm",
        "rite_rank",
        "base_area_nm",
        "rite_regn_nm",
        "created_at",
    ]
    list_filter = ["base_area_cd", "rite_regn_cd", "rite_rank", "rite_ctgry_lcls_nm"]
    search_fields = ["base_tats_nm", "rite_tats_nm", "base_area_nm", "rite_regn_nm"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["rite_rank", "base_tats_nm"]

    fieldsets = (
        (
            "기준 관광지",
            {
                "fields": (
                    "base_tats_nm",
                    "base_area_cd",
                    "base_area_nm",
                    "base_signgu_cd",
                    "base_signgu_nm",
                )
            },
        ),
        (
            "연관 관광지",
            {
                "fields": (
                    "rite_tats_cd",
                    "rite_tats_nm",
                    "rite_rank",
                    "rite_regn_cd",
                    "rite_regn_nm",
                    "rite_signgu_cd",
                    "rite_signgu_nm",
                )
            },
        ),
        (
            "카테고리 정보",
            {
                "fields": (
                    "rite_ctgry_lcls_nm",
                    "rite_ctgry_mcls_nm",
                    "rite_ctgry_scls_nm",
                )
            },
        ),
        ("기타 정보", {"fields": ("base_ym",)}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(TourismAPICache)
class TourismAPICacheAdmin(admin.ModelAdmin):
    list_display = ["api_endpoint", "cache_key", "expires_at", "created_at"]
    list_filter = ["api_endpoint", "expires_at"]
    search_fields = ["cache_key", "api_endpoint"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("캐시 정보", {"fields": ("cache_key", "api_endpoint", "expires_at")}),
        ("요청 정보", {"fields": ("request_params",)}),
        ("응답 데이터", {"fields": ("data",), "classes": ("collapse",)}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    actions = ["cleanup_expired_cache"]

    def cleanup_expired_cache(self, request, queryset):
        """만료된 캐시 정리"""
        from django.utils import timezone

        deleted_count = TourismAPICache.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()[0]
        self.message_user(request, f"{deleted_count}개의 만료된 캐시가 정리되었습니다.")

    cleanup_expired_cache.short_description = "만료된 캐시 정리"


@admin.register(POIRecommendationCache)
class POIRecommendationCacheAdmin(admin.ModelAdmin):
    list_display = [
        "cache_key",
        "latitude",
        "longitude",
        "radius_km",
        "expires_at",
        "created_at",
    ]
    list_filter = ["expires_at", "radius_km"]
    search_fields = ["cache_key"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("위치 정보", {"fields": ("latitude", "longitude", "radius_km")}),
        ("캐시 정보", {"fields": ("cache_key", "expires_at")}),
        ("추천 결과", {"fields": ("recommended_pois",), "classes": ("collapse",)}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    actions = ["cleanup_expired_cache"]

    def cleanup_expired_cache(self, request, queryset):
        """만료된 캐시 정리"""
        from django.utils import timezone

        deleted_count = POIRecommendationCache.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()[0]
        self.message_user(
            request, f"{deleted_count}개의 만료된 추천 캐시가 정리되었습니다."
        )

    cleanup_expired_cache.short_description = "만료된 추천 캐시 정리"
