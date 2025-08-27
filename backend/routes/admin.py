from django.contrib import admin
from .models import Route, RoutePlace


class RoutePlaceInline(admin.TabularInline):
    model = RoutePlace
    extra = 1
    fields = ["place", "sequence", "memo"]
    ordering = ["sequence"]


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "created_by",
        "places_count",
        "created_at",
        "updated_at",
    ]
    list_filter = [
        "created_by",
        "created_at",
        "updated_at",
    ]
    search_fields = ["title", "description", "created_by__username"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("기본 정보", {"fields": ("title", "description", "created_by")}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    inlines = [RoutePlaceInline]

    actions = ["duplicate_routes"]

    def places_count(self, obj):
        """경로에 포함된 장소 수를 반환"""
        return obj.places.count()

    places_count.short_description = "장소 수"

    def duplicate_routes(self, request, queryset):
        """선택된 경로들을 복제"""
        duplicated_count = 0
        for route in queryset:
            # 새 경로 생성
            new_route = Route.objects.create(
                title=f"{route.title} (복사본)",
                description=route.description,
                created_by=request.user,
            )

            # 경로의 장소들 복제
            for route_place in route.route_places.all():
                RoutePlace.objects.create(
                    route=new_route,
                    place=route_place.place,
                    sequence=route_place.sequence,
                    memo=route_place.memo,
                )

            duplicated_count += 1

        self.message_user(request, f"{duplicated_count}개의 경로가 복제되었습니다.")

    duplicate_routes.short_description = "선택된 경로 복제"


@admin.register(RoutePlace)
class RoutePlaceAdmin(admin.ModelAdmin):
    list_display = [
        "route",
        "place",
        "sequence",
        "memo",
        "created_at",
    ]
    list_filter = [
        "route__created_by",
        "sequence",
        "created_at",
    ]
    search_fields = ["route__title", "place__name", "memo"]
    ordering = ["route__title", "sequence"]

    fieldsets = (
        ("경로 정보", {"fields": ("route", "place", "sequence", "memo")}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    list_editable = ["sequence", "memo"]
    actions = ["reorder_sequences"]

    def reorder_sequences(self, request, queryset):
        """선택된 경로 장소들의 순서를 재정렬"""
        # 경로별로 그룹화하여 순서 재정렬
        route_groups = {}
        for route_place in queryset:
            if route_place.route not in route_groups:
                route_groups[route_place.route] = []
            route_groups[route_place.route].append(route_place)

        for route, route_places in route_groups.items():
            # 순서대로 정렬
            sorted_places = sorted(route_places, key=lambda x: x.sequence)
            for i, route_place in enumerate(sorted_places, 1):
                route_place.sequence = i
                route_place.save()

        self.message_user(
            request, f"{queryset.count()}개의 경로 장소 순서가 재정렬되었습니다."
        )

    reorder_sequences.short_description = "경로 장소 순서 재정렬"
