from django.contrib import admin
from .models import Place, PlaceCategory, PlaceHour, MenuItem


class PlaceCategoryInline(admin.TabularInline):
    model = PlaceCategory
    extra = 1
    fields = ["category", "is_primary"]


class PlaceHourInline(admin.TabularInline):
    model = PlaceHour
    extra = 1
    fields = ["day_of_week", "open_time", "close_time"]


class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 1
    fields = ["name", "price", "description", "is_active"]


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "place_type",
        "avg_rating",
        "created_by",
        "address",
        "created_at",
    ]
    list_filter = [
        "place_type",
        "avg_rating",
        "created_by",
        "created_at",
        "updated_at",
    ]
    search_fields = ["name", "address", "road_address", "external_id"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("기본 정보", {"fields": ("name", "place_type", "created_by", "avg_rating")}),
        ("위치 정보", {"fields": ("lat", "lng", "address", "road_address")}),
        (
            "연락처 정보",
            {"fields": ("phone_number", "external_url"), "classes": ("collapse",)},
        ),
        ("외부 시스템", {"fields": ("external_id",), "classes": ("collapse",)}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    inlines = [PlaceCategoryInline, PlaceHourInline, MenuItemInline]

    actions = ["update_rating_average"]

    def update_rating_average(self, request, queryset):
        """선택된 장소들의 평점 평균을 업데이트"""
        # 실제 구현에서는 리뷰 데이터를 기반으로 평균을 계산해야 함
        self.message_user(
            request, "평점 평균 업데이트 기능은 리뷰 시스템과 연동되어야 합니다."
        )

    update_rating_average.short_description = "평점 평균 업데이트"


@admin.register(PlaceCategory)
class PlaceCategoryAdmin(admin.ModelAdmin):
    list_display = [
        "place",
        "category",
        "is_primary",
        "created_at",
    ]
    list_filter = [
        "is_primary",
        "category__category_type",
        "created_at",
    ]
    search_fields = ["place__name", "category__name"]
    ordering = ["place__name", "-is_primary"]

    fieldsets = (
        ("관계 정보", {"fields": ("place", "category", "is_primary")}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    list_editable = ["is_primary"]
    actions = ["set_as_primary", "set_as_secondary"]

    def set_as_primary(self, request, queryset):
        """선택된 카테고리들을 주 카테고리로 설정"""
        for place_category in queryset:
            # 같은 장소의 다른 카테고리들을 보조로 설정
            PlaceCategory.objects.filter(place=place_category.place).update(
                is_primary=False
            )
            # 선택된 것을 주로 설정
            place_category.is_primary = True
            place_category.save()

        self.message_user(
            request, f"{queryset.count()}개의 카테고리가 주 카테고리로 설정되었습니다."
        )

    set_as_primary.short_description = "주 카테고리로 설정"

    def set_as_secondary(self, request, queryset):
        """선택된 카테고리들을 보조 카테고리로 설정"""
        updated = queryset.update(is_primary=False)
        self.message_user(
            request, f"{updated}개의 카테고리가 보조 카테고리로 설정되었습니다."
        )

    set_as_secondary.short_description = "보조 카테고리로 설정"


@admin.register(PlaceHour)
class PlaceHourAdmin(admin.ModelAdmin):
    list_display = [
        "place",
        "day_of_week",
        "open_time",
        "close_time",
        "created_at",
    ]
    list_filter = [
        "day_of_week",
        "open_time",
        "close_time",
        "created_at",
    ]
    search_fields = ["place__name"]
    ordering = ["place__name", "day_of_week"]

    fieldsets = (
        (
            "영업 시간 정보",
            {"fields": ("place", "day_of_week", "open_time", "close_time")},
        ),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "place",
        "price",
        "is_active",
        "created_at",
    ]
    list_filter = [
        "is_active",
        "price",
        "place__place_type",
        "created_at",
    ]
    search_fields = ["name", "place__name", "description"]
    ordering = ["place__name", "name"]

    fieldsets = (
        (
            "메뉴 정보",
            {"fields": ("place", "name", "price", "description", "is_active")},
        ),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    list_editable = ["price", "is_active"]
    actions = ["activate_menu_items", "deactivate_menu_items"]

    def activate_menu_items(self, request, queryset):
        """선택된 메뉴 아이템들을 활성화"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated}개의 메뉴 아이템이 활성화되었습니다.")

    activate_menu_items.short_description = "선택된 메뉴 아이템 활성화"

    def deactivate_menu_items(self, request, queryset):
        """선택된 메뉴 아이템들을 비활성화"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated}개의 메뉴 아이템이 비활성화되었습니다.")

    deactivate_menu_items.short_description = "선택된 메뉴 아이템 비활성화"
