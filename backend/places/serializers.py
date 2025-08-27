from rest_framework import serializers
from .models import Place, PlaceCategory, PlaceHour, MenuItem


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = "__all__"


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
