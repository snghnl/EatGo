from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserPreference


class UserPreferenceInline(admin.TabularInline):
    model = UserPreference
    extra = 1
    fields = ["category", "preference_score"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "username",
        "email",
        "login_method",
        "is_active",
        "is_staff",
        "date_joined",
        "last_login",
    ]
    list_filter = [
        "login_method",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
        "last_login",
    ]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["-date_joined"]

    fieldsets = (
        ("기본 정보", {"fields": ("username", "email", "password")}),
        ("개인 정보", {"fields": ("first_name", "last_name", "profile_image_url")}),
        (
            "인증 정보",
            {"fields": ("login_method", "is_active", "is_staff", "is_superuser")},
        ),
        ("권한", {"fields": ("groups", "user_permissions"), "classes": ("collapse",)}),
        (
            "중요한 날짜",
            {"fields": ("last_login", "date_joined"), "classes": ("collapse",)},
        ),
    )

    add_fieldsets = (
        (
            "사용자 생성",
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )

    inlines = [UserPreferenceInline]

    actions = ["activate_users", "deactivate_users", "reset_passwords"]

    def activate_users(self, request, queryset):
        """선택된 사용자들을 활성화"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated}명의 사용자가 활성화되었습니다.")

    activate_users.short_description = "선택된 사용자 활성화"

    def deactivate_users(self, request, queryset):
        """선택된 사용자들을 비활성화"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated}명의 사용자가 비활성화되었습니다.")

    deactivate_users.short_description = "선택된 사용자 비활성화"

    def reset_passwords(self, request, queryset):
        """선택된 사용자들의 비밀번호를 초기화"""
        from django.contrib import messages

        for user in queryset:
            if user == request.user:
                messages.warning(
                    request, f"자신의 비밀번호는 초기화할 수 없습니다: {user.username}"
                )
                continue

            # 임시 비밀번호 생성 (실제로는 이메일로 전송해야 함)
            temp_password = User.objects.make_random_password()
            user.set_password(temp_password)
            user.save()
            messages.info(request, f"{user.username}의 임시 비밀번호: {temp_password}")

        self.message_user(
            request, f"{queryset.count()}명의 사용자 비밀번호가 초기화되었습니다."
        )

    reset_passwords.short_description = "선택된 사용자 비밀번호 초기화"


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "category",
        "preference_score",
        "created_at",
        "updated_at",
    ]
    list_filter = [
        "category__category_type",
        "preference_score",
        "created_at",
        "updated_at",
    ]
    search_fields = ["user__username", "category__name"]
    ordering = ["user__username", "-preference_score"]

    fieldsets = (
        ("사용자 선호도", {"fields": ("user", "category", "preference_score")}),
        (
            "시스템 정보",
            {"fields": ("id", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    list_editable = ["preference_score"]
    actions = ["normalize_preferences", "reset_preferences"]

    def normalize_preferences(self, request, queryset):
        """선택된 선호도들을 0-1 범위로 정규화"""
        for preference in queryset:
            if preference.preference_score > 1.0:
                preference.preference_score = 1.0
            elif preference.preference_score < 0.0:
                preference.preference_score = 0.0
            preference.save()

        self.message_user(request, f"{queryset.count()}개의 선호도가 정규화되었습니다.")

    normalize_preferences.short_description = "선호도 정규화 (0-1 범위)"

    def reset_preferences(self, request, queryset):
        """선택된 선호도들을 기본값(0.5)으로 초기화"""
        updated = queryset.update(preference_score=0.5)
        self.message_user(
            request, f"{updated}개의 선호도가 기본값(0.5)으로 초기화되었습니다."
        )

    reset_preferences.short_description = "선호도 기본값으로 초기화"
