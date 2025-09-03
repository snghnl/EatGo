from rest_framework import serializers
from .models import District, Province


class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = "__all__"


class DistrictSerializer(serializers.ModelSerializer):
    province = ProvinceSerializer(read_only=True)

    class Meta:
        model = District
        fields = "__all__"


class DistrictListSerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source="province.name", read_only=True)

    class Meta:
        model = District
        fields = [
            "id",
            "name",
            "name_en",
            "longitude",
            "latitude",
            "province_name",
            "is_active",
        ]
