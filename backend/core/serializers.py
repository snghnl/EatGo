from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "icon",
            "color",
            "category_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
