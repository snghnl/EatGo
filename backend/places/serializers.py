from rest_framework import serializers
from .models import Place, PlaceCategory, PlaceHour, MenuItem


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = "__all__"


class PlaceRecommendInputSerializer(serializers.Serializer):
    lat = serializers.FloatField(required=True)
    lng = serializers.FloatField(required=True)
    max_distance_km = serializers.FloatField(allow_null=True, required=False)
    limit = serializers.IntegerField(allow_null=True, required=False)
    category_filter = serializers.ListField(
        child=serializers.CharField(), allow_null=True, required=False
    )


class PlaceRecommendOutputSerializer(serializers.Serializer):
    class PlaceRecommendSerializer(serializers.Serializer):
        name = serializers.CharField(max_length=255, source="place_name")
        lat = serializers.FloatField(required=True, source="y")
        lng = serializers.FloatField(required=True, source="x")
        phone_number = serializers.CharField(source="phone", allow_null=True)
        place_type = serializers.CharField(source="category_name")
        address = serializers.CharField(source="address_name", allow_null=True)
        road_address = serializers.CharField(
            source="road_address_name", allow_null=True
        )
        external_id = serializers.CharField(source="id")  # External API ID
        external_url = serializers.URLField(allow_null=True, source="place_url")

    places = PlaceRecommendSerializer(many=True)


class PlaceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceCategory
        fields = "__all__"


class PlaceHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceHour
        fields = "__all__"


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = "__all__"
