from django.contrib import admin
from .models import Province, District

# Register your models here.


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ["name", "name_en", "is_active"]


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ["name", "name_en", "is_active"]
