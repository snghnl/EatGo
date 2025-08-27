# Register your models here.
from django.contrib import admin
from .models import TravelCourse, TravelCourseRoute


class TravelCourseRouteInline(admin.TabularInline):
    model = TravelCourseRoute
    extra = 1
    fields = ["route", "sequence"]
    ordering = ["sequence"]


@admin.register(TravelCourse)
class TravelCourseAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "created_by",
        "routes_count",
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

    inlines = [TravelCourseRouteInline]

    actions = ["duplicate_courses"]

    def routes_count(self, obj):
        """여행 코스에 포함된 경로 수를 반환"""
        return obj.routes.count()

    routes_count.short_description = "경로 수"

    def duplicate_courses(self, request, queryset):
        """선택된 여행 코스들을 복제"""
        duplicated_count = 0
        for course in queryset:
            # 새 여행 코스 생성
            new_course = TravelCourse.objects.create(
                title=f"{course.title} (복사본)",
                description=course.description,
                created_by=request.user,
            )

            # 여행 코스의 경로들 복제
            for course_route in course.travel_course_routes.all():
                TravelCourseRoute.objects.create(
                    travel_course=new_course,
                    route=course_route.route,
                    sequence=course_route.sequence,
                )

            duplicated_count += 1

        self.message_user(
            request, f"{duplicated_count}개의 여행 코스가 복제되었습니다."
        )

    duplicate_courses.short_description = "선택된 여행 코스 복제"


@admin.register(TravelCourseRoute)
class TravelCourseRouteAdmin(admin.ModelAdmin):
    list_display = [
        "travel_course",
        "route",
        "sequence",
        "created_at",
    ]
    list_filter = [
        "travel_course__created_by",
        "sequence",
        "created_at",
    ]
    search_fields = ["travel_course__title", "route__title"]
    ordering = ["travel_course__title", "sequence"]

    fieldsets = (
        ("여행 코스 정보", {"fields": ("travel_course", "route", "sequence")}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    list_editable = ["sequence"]
    actions = ["reorder_sequences"]

    def reorder_sequences(self, request, queryset):
        """선택된 여행 코스 경로들의 순서를 재정렬"""
        # 여행 코스별로 그룹화하여 순서 재정렬
        course_groups = {}
        for course_route in queryset:
            if course_route.travel_course not in course_groups:
                course_groups[course_route.travel_course] = []
            course_groups[course_route.travel_course].append(course_route)

        for course, course_routes in course_groups.items():
            # 순서대로 정렬
            sorted_routes = sorted(course_routes, key=lambda x: x.sequence)
            for i, course_route in enumerate(sorted_routes, 1):
                course_route.sequence = i
                course_route.save()

        self.message_user(
            request, f"{queryset.count()}개의 여행 코스 경로 순서가 재정렬되었습니다."
        )

    reorder_sequences.short_description = "여행 코스 경로 순서 재정렬"
