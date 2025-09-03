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
    places = PlaceSerializer(many=True)


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
