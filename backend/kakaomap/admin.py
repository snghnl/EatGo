# Register your models here.
#
# When you add models to the kakaomap app, you can register them here.
# Example:
#
# from .models import KakaoMapPOI, KakaoMapSearch
#
# @admin.register(KakaoMapPOI)
# class KakaoMapPOIAdmin(admin.ModelAdmin):
#     list_display = ['name', 'address', 'category', 'created_at']
#     list_filter = ['category', 'created_at']
#     search_fields = ['name', 'address']
#     ordering = ['-created_at']
#
# @admin.register(KakaoMapSearch)
# class KakaoMapSearchAdmin(admin.ModelAdmin):
#     list_display = ['query', 'user', 'results_count', 'searched_at']
#     list_filter = ['searched_at', 'user']
#     search_fields = ['query', 'user__username']
#     ordering = ['-searched_at']
