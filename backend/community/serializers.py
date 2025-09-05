from rest_framework import serializers
from .models import Post, PostImage, Comment, Like
from accounts.models import User
from travel_courses.models import TravelCourse


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information for post/comment display"""

    class Meta:
        model = User
        fields = ["id", "username", "profile_image_url"]


class TravelCourseBasicSerializer(serializers.ModelSerializer):
    """Basic travel course information for post display"""

    class Meta:
        model = TravelCourse
        fields = ["id", "title", "description", "destination", "start_date", "end_date"]


class PostImageSerializer(serializers.ModelSerializer):
    """Serializer for post images"""

    class Meta:
        model = PostImage
        fields = ["id", "url", "sequence", "alt_text"]


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for post comments"""

    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "content", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for post likes"""

    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ["id", "user", "created_at"]
        read_only_fields = ["created_at"]


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for listing posts (summary view)"""

    user = UserBasicSerializer(read_only=True)
    travel_course = TravelCourseBasicSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "travel_course",
            "title",
            "content",
            "likes_count",
            "comments_count",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["likes_count", "comments_count", "created_at", "updated_at"]


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed post view including comments"""

    user = UserBasicSerializer(read_only=True)
    travel_course = TravelCourseBasicSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "travel_course",
            "title",
            "content",
            "likes_count",
            "comments_count",
            "images",
            "comments",
            "is_liked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["likes_count", "comments_count", "created_at", "updated_at"]

    def get_is_liked(self, obj):
        """Check if the current user has liked this post"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
