from rest_framework import serializers
from .models import POIData, POIPhoto, POIOpeningHours, POIReview


class POIPhotoSerializer(serializers.ModelSerializer):
    """Serializer for POI photos"""

    class Meta:
        model = POIPhoto
        fields = ["photo_reference", "photo_url", "width", "height"]


class POIOpeningHoursSerializer(serializers.ModelSerializer):
    """Serializer for POI opening hours"""

    day_name = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = POIOpeningHours
        fields = ["day_of_week", "day_name", "open_time", "close_time", "is_closed"]


class POIReviewSerializer(serializers.ModelSerializer):
    """Serializer for POI reviews"""

    class Meta:
        model = POIReview
        fields = ["author_name", "rating", "text", "review_time"]


class POIDataSerializer(serializers.ModelSerializer):
    """Serializer for POI data"""

    photos = POIPhotoSerializer(many=True, read_only=True)
    opening_hours = POIOpeningHoursSerializer(many=True, read_only=True)
    reviews = POIReviewSerializer(many=True, read_only=True)

    class Meta:
        model = POIData
        fields = [
            "id",
            "external_id",
            "provider",
            "name",
            "address",
            "latitude",
            "longitude",
            "phone",
            "website",
            "rating",
            "price_level",
            "types",
            "photos",
            "opening_hours",
            "reviews",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class KakaoSearchRequestSerializer(serializers.Serializer):
    """Serializer for Kakao search API request validation"""

    query = serializers.CharField(max_length=255, help_text="Search keyword")
    x = serializers.FloatField(required=False, help_text="Longitude")
    y = serializers.FloatField(required=False, help_text="Latitude")
    radius = serializers.IntegerField(
        default=20000, min_value=1, max_value=20000, help_text="Search radius in meters"
    )
    page = serializers.IntegerField(default=1, min_value=1, max_value=45)
    size = serializers.IntegerField(default=15, min_value=1, max_value=15)
    sort = serializers.ChoiceField(choices=["accuracy", "distance"], default="accuracy")

    def validate(self, data):
        """Validate that if x or y is provided, both must be provided"""
        x = data.get("x")
        y = data.get("y")

        if (x is not None and y is None) or (x is None and y is not None):
            raise serializers.ValidationError(
                "Both longitude (x) and latitude (y) must be provided together"
            )

        return data


class KakaoCategorySearchRequestSerializer(serializers.Serializer):
    """Serializer for Kakao category search API request validation"""

    CATEGORY_CHOICES = [
        ("MT1", "대형마트"),
        ("CS2", "편의점"),
        ("PS3", "어린이집, 유치원"),
        ("SC4", "학교"),
        ("AC5", "학원"),
        ("PK6", "주차장"),
        ("OL7", "주유소, 충전소"),
        ("SW8", "지하철역"),
        ("BK9", "은행"),
        ("CT1", "문화시설"),
        ("AG2", "중개업소"),
        ("PO3", "공공기관"),
        ("AT4", "관광명소"),
        ("AD5", "숙박"),
        ("FD6", "음식점"),
        ("CE7", "카페"),
        ("HP8", "병원"),
        ("PM9", "약국"),
    ]

    category_group_code = serializers.ChoiceField(choices=CATEGORY_CHOICES)
    x = serializers.FloatField(help_text="Longitude")
    y = serializers.FloatField(help_text="Latitude")
    radius = serializers.IntegerField(default=20000, min_value=1, max_value=20000)
    page = serializers.IntegerField(default=1, min_value=1, max_value=45)
    size = serializers.IntegerField(default=15, min_value=1, max_value=15)
    sort = serializers.ChoiceField(choices=["accuracy", "distance"], default="accuracy")


class GooglePlaceDetailsRequestSerializer(serializers.Serializer):
    """Serializer for Google Place Details API request validation"""

    place_id = serializers.CharField(max_length=255)
    fields = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        help_text="List of fields to return",
    )


class GoogleNearbySearchRequestSerializer(serializers.Serializer):
    """Serializer for Google Nearby Search API request validation"""

    lat = serializers.FloatField(help_text="Latitude")
    lng = serializers.FloatField(help_text="Longitude")
    radius = serializers.IntegerField(default=1500, min_value=1, max_value=50000)
    place_type = serializers.CharField(max_length=50, required=False)
    keyword = serializers.CharField(max_length=255, required=False)


class GoogleTextSearchRequestSerializer(serializers.Serializer):
    """Serializer for Google Text Search API request validation"""

    query = serializers.CharField(max_length=255)
    location = serializers.CharField(
        max_length=50, required=False, help_text="Location bias in lat,lng format"
    )
    radius = serializers.IntegerField(required=False, min_value=1, max_value=50000)
