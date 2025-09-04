from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema

from . import services, selectors
from .models import Post, Comment
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    CommentSerializer,
)
from travel_courses.models import TravelCourse


class PostListView(APIView):
    """
    List posts and create new posts
    """

    permission_classes = [IsAuthenticatedOrReadOnly]

    class InputSerializer(serializers.Serializer):
        travel_course_id = serializers.UUIDField(required=False)
        title = serializers.CharField(max_length=255)
        content = serializers.CharField()
        images = serializers.ListField(child=serializers.DictField(), required=False)

    class OutputSerializer(PostListSerializer):
        pass

    @swagger_auto_schema(
        operation_description="Get list of community posts",
        responses={200: OutputSerializer(many=True)},
    )
    def get(self, request):
        """List all posts"""
        posts = selectors.post_list()
        serializer = self.OutputSerializer(
            posts, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Create a new community post",
        request_body=InputSerializer,
        responses={201: OutputSerializer},
    )
    def post(self, request):
        """Create a new post"""
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        travel_course = None
        if travel_course_id := serializer.validated_data.get("travel_course_id"):
            travel_course = get_object_or_404(TravelCourse, id=travel_course_id)

        post = services.post_create(
            user=request.user,
            title=serializer.validated_data["title"],
            content=serializer.validated_data["content"],
            travel_course=travel_course,
            images=serializer.validated_data.get("images", []),
        )

        output_serializer = self.OutputSerializer(post, context={"request": request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class PostDetailView(APIView):
    """
    Retrieve, update or delete a post
    """

    permission_classes = [IsAuthenticatedOrReadOnly]

    class InputSerializer(serializers.Serializer):
        title = serializers.CharField(max_length=255, required=False)
        content = serializers.CharField(required=False)
        images = serializers.ListField(child=serializers.DictField(), required=False)

    class OutputSerializer(PostDetailSerializer):
        pass

    @swagger_auto_schema(
        operation_description="Get post details", responses={200: OutputSerializer}
    )
    def get(self, request, post_id):
        """Get post details"""
        post = selectors.post_detail(post_id=post_id, user=request.user)
        serializer = self.OutputSerializer(post, context={"request": request})
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update a post",
        request_body=InputSerializer,
        responses={200: OutputSerializer},
    )
    def patch(self, request, post_id):
        """Update a post"""
        post = get_object_or_404(Post, id=post_id, user=request.user)

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_post = services.post_update(
            post=post,
            title=serializer.validated_data.get("title"),
            content=serializer.validated_data.get("content"),
            images=serializer.validated_data.get("images"),
        )

        output_serializer = self.OutputSerializer(
            updated_post, context={"request": request}
        )
        return Response(output_serializer.data)

    @swagger_auto_schema(
        operation_description="Delete a post",
        responses={204: "Post deleted successfully"},
    )
    def delete(self, request, post_id):
        """Delete a post"""
        post = get_object_or_404(Post, id=post_id, user=request.user)
        services.post_delete(post=post)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostLikeView(APIView):
    """
    Toggle like status for a post
    """

    permission_classes = [IsAuthenticated]

    class OutputSerializer(serializers.Serializer):
        liked = serializers.BooleanField()

    @swagger_auto_schema(
        operation_description="Toggle like status for a post",
        responses={200: OutputSerializer},
    )
    def post(self, request, post_id):
        """Toggle like for a post"""
        post = get_object_or_404(Post, id=post_id)
        result = services.post_like_toggle(user=request.user, post=post)
        return Response(result)


class PostCommentsView(APIView):
    """
    List comments for a post and create new comments
    """

    permission_classes = [IsAuthenticatedOrReadOnly]

    class InputSerializer(serializers.Serializer):
        content = serializers.CharField()

    class OutputSerializer(CommentSerializer):
        pass

    @swagger_auto_schema(
        operation_description="Get comments for a post",
        responses={200: OutputSerializer(many=True)},
    )
    def get(self, request, post_id):
        """List comments for a post"""
        post = get_object_or_404(Post, id=post_id)
        comments = selectors.post_comments_list(post=post)
        serializer = self.OutputSerializer(
            comments, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Create a comment on a post",
        request_body=InputSerializer,
        responses={201: OutputSerializer},
    )
    def post(self, request, post_id):
        """Create a comment on a post"""
        post = get_object_or_404(Post, id=post_id)

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = services.comment_create(
            user=request.user, post=post, content=serializer.validated_data["content"]
        )

        output_serializer = self.OutputSerializer(comment, context={"request": request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class CommentDetailView(APIView):
    """
    Update or delete a comment
    """

    permission_classes = [IsAuthenticated]

    class InputSerializer(serializers.Serializer):
        content = serializers.CharField()

    class OutputSerializer(CommentSerializer):
        pass

    @swagger_auto_schema(
        operation_description="Update a comment",
        request_body=InputSerializer,
        responses={200: OutputSerializer},
    )
    def patch(self, request, comment_id):
        """Update a comment"""
        comment = get_object_or_404(Comment, id=comment_id, user=request.user)

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_comment = services.comment_update(
            comment=comment, content=serializer.validated_data["content"]
        )

        output_serializer = self.OutputSerializer(
            updated_comment, context={"request": request}
        )
        return Response(output_serializer.data)

    @swagger_auto_schema(
        operation_description="Delete a comment",
        responses={204: "Comment deleted successfully"},
    )
    def delete(self, request, comment_id):
        """Delete a comment"""
        comment = get_object_or_404(Comment, id=comment_id, user=request.user)
        services.comment_delete(comment=comment)
        return Response(status=status.HTTP_204_NO_CONTENT)
