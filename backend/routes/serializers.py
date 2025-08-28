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
    """Serializer for route recommendation input data."""

    # Required location data
    lat = serializers.FloatField(
        min_value=-90.0, max_value=90.0, help_text="User's current latitude (-90 to 90)"
    )
    lng = serializers.FloatField(
        min_value=-180.0,
        max_value=180.0,
        help_text="User's current longitude (-180 to 180)",
    )

    # Optional parameters
    max_distance_km = serializers.FloatField(
        default=20.0,
        min_value=0.1,
        max_value=100.0,
        help_text="Maximum distance in kilometers for recommendations",
    )
    limit = serializers.IntegerField(
        default=20,
        min_value=1,
        max_value=50,
        help_text="Maximum number of places to recommend",
    )

    # Category filtering options
    category_filter = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        help_text="List of category names to filter by",
    )

    # User preferences (optional)
    preferences = CategoryPreferenceSerializer(
        many=True, required=False, help_text="User's category preferences with scores"
    )

    # Whether to use stored user preferences from database
    use_stored_preferences = serializers.BooleanField(
        default=True, help_text="Whether to use user's stored preferences from profile"
    )

    def validate(self, data):
        """Cross-field validation."""
        preferences = data.get("preferences", [])
        use_stored_preferences = data.get("use_stored_preferences", True)

        # If preferences are provided, ensure they don't conflict with stored preferences flag
        if preferences and use_stored_preferences:
            raise serializers.ValidationError(
                "Cannot provide both custom preferences and use stored preferences. "
                "Set use_stored_preferences=false to use custom preferences."
            )

        return data
