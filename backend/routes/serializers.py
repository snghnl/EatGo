from rest_framework import serializers
from .models import Route
from core.models import Category


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = "__all__"


class CategoryPreferenceSerializer(serializers.Serializer):
    """Serializer for category preference input."""

    category_id = serializers.UUIDField()
    preference_score = serializers.FloatField(min_value=0.0, max_value=1.0)

    def validate_category_id(self, value):
        """Validate that the category exists and is active."""
        if not Category.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive category ID.")
        return value


class RouteRecommendationInputSerializer(serializers.Serializer):
    """Query serializer for GET params only (no nested objects)."""

    lat = serializers.FloatField(required=True)
    lng = serializers.FloatField(required=True)
    max_distance_km = serializers.FloatField(allow_null=True, required=False)
    limit = serializers.IntegerField(allow_null=True, required=False)
    category_filter = serializers.ListField(
        child=serializers.CharField(), allow_null=True, required=False
    )


class RouteRecommendationOutputSerializer(serializers.Serializer):
    routes = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of route options with places, distances, and metadata",
    )
    user_location = serializers.DictField(child=serializers.FloatField())
