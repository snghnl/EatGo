from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Comment
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    PostCreateSerializer,
    CommentSerializer,
)
from .services import CommunityService
from .permissions import IsOwnerOrReadOnly, IsAuthenticatedOrReadOnly, IsAuthenticated


class PostViewSet(viewsets.ModelViewSet):
    """
    커뮤니티 게시글 ViewSet
    """

    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["user", "travel_course"]
    ordering_fields = ["created_at", "likes_count", "comments_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return CommunityService.get_posts_queryset()

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        elif self.action == "create":
            return PostCreateSerializer
        else:
            return PostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like_toggle(self, request, pk=None):
        """
        좋아요 토글 API
        """
        post = self.get_object()
        is_liked, likes_count = CommunityService.toggle_like(post, request.user)

        return Response({"is_liked": is_liked, "likes_count": likes_count})

    @action(
        detail=True,
        methods=["get", "post"],
        permission_classes=[IsAuthenticatedOrReadOnly],
    )
    def comments(self, request, pk=None):
        """
        댓글 목록 조회 및 생성 API
        """
        post = self.get_object()

        if request.method == "GET":
            comments = CommunityService.get_comments_queryset(post.id)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == "POST":
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "로그인이 필요합니다."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            content = request.data.get("content")
            if not content:
                return Response(
                    {"content": ["댓글 내용을 입력해주세요."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                comment = CommunityService.create_comment(post, request.user, content)
                serializer = CommentSerializer(comment)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    """
    댓글 ViewSet
    """

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(is_active=True).select_related("user", "post")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        CommunityService.delete_comment(comment)
        return Response(status=status.HTTP_204_NO_CONTENT)
