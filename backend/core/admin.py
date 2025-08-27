from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category_type",
        "is_active",
        "created_at",
        "updated_at",
    ]
    list_filter = [
        "category_type",
        "is_active",
        "created_at",
        "updated_at",
    ]
    search_fields = ["name", "description"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["name"]

    fieldsets = (
        (
            "기본 정보",
            {"fields": ("name", "description", "category_type", "is_active")},
        ),
        ("스타일링", {"fields": ("icon", "color"), "classes": ("collapse",)}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    list_editable = ["is_active"]
    actions = ["activate_categories", "deactivate_categories"]

    def activate_categories(self, request, queryset):
        """선택된 카테고리들을 활성화"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated}개의 카테고리가 활성화되었습니다.")

    activate_categories.short_description = "선택된 카테고리 활성화"

    def deactivate_categories(self, request, queryset):
        """선택된 카테고리들을 비활성화"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated}개의 카테고리가 비활성화되었습니다.")

    deactivate_categories.short_description = "선택된 카테고리 비활성화"
