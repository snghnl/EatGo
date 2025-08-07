from rest_framework import serializers
from .models import Post, Comment, Like
from accounts.models import User
from travel_courses.models import TravelCourse


class UserBasicSerializer(serializers.ModelSerializer):
    """
    사용자 기본 정보 시리얼라이저
    """

    class Meta:
        model = User
        fields = ["id", "username", "profile_image_url"]


class TravelCourseBasicSerializer(serializers.ModelSerializer):
    """
    여행 코스 기본 정보 시리얼라이저
    """

    class Meta:
        model = TravelCourse
        fields = ["id", "title", "description"]


class CommentSerializer(serializers.ModelSerializer):
    """
    댓글 시리얼라이저
    """

    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def validate_content(self, value):
        """
        댓글 내용 검증
        """
        if not value.strip():
            raise serializers.ValidationError("댓글 내용을 입력해주세요.")
        if len(value) > 500:
            raise serializers.ValidationError("댓글은 500자를 초과할 수 없습니다.")
        return value


class PostListSerializer(serializers.ModelSerializer):
    """
    게시글 목록용 시리얼라이저
    """

    user = UserBasicSerializer(read_only=True)
    travel_course = TravelCourseBasicSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "travel_course",
            "content",
            "likes_count",
            "comments_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]

    def get_is_liked(self, obj):
        """
        현재 사용자의 좋아요 여부 확인
        """
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostDetailSerializer(serializers.ModelSerializer):
    """
    게시글 상세용 시리얼라이저 (댓글 포함)
    """

    user = UserBasicSerializer(read_only=True)
    travel_course = TravelCourseBasicSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "travel_course",
            "content",
            "likes_count",
            "comments_count",
            "is_liked",
            "comments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "likes_count",
            "comments_count",
            "created_at",
            "updated_at",
        ]

    def get_is_liked(self, obj):
        """
        현재 사용자의 좋아요 여부 확인
        """
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """
    게시글 작성용 시리얼라이저
    """

    class Meta:
        model = Post
        fields = ["content", "travel_course"]

    def validate_content(self, value):
        """
        게시글 내용 검증
        """
        if not value.strip():
            raise serializers.ValidationError("게시글 내용을 입력해주세요.")
        if len(value) > 2000:
            raise serializers.ValidationError("게시글은 2000자를 초과할 수 없습니다.")
        return value

    def validate_travel_course(self, value):
        """
        여행 코스 검증 (선택사항이므로 None 허용)
        """
        if value and not hasattr(value, "created_by"):
            raise serializers.ValidationError("유효하지 않은 여행 코스입니다.")
        return value


class LikeSerializer(serializers.ModelSerializer):
    """
    좋아요 시리얼라이저
    """

    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ["id", "user", "created_at"]
        read_only_fields = ["id", "user", "created_at"]
