from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like


class CommunityService:
    """커뮤니티 관련 비즈니스 로직을 처리하는 서비스 클래스"""

    @staticmethod
    @transaction.atomic
    def toggle_like(post, user):
        """좋아요 토글 (생성/삭제)

        Args:
            post: Post 객체
            user: User 객체

        Returns:
            tuple: (is_liked, likes_count)
        """
        like, created = Like.objects.get_or_create(post=post, user=user)

        if not created:
            # 좋아요 취소
            like.delete()
            Post.objects.filter(id=post.id).update(likes_count=F("likes_count") - 1)
            is_liked = False
        else:
            # 좋아요 추가
            Post.objects.filter(id=post.id).update(likes_count=F("likes_count") + 1)
            is_liked = True

        post.refresh_from_db()
        return is_liked, post.likes_count

    @staticmethod
    @transaction.atomic
    def create_comment(post, user, content):
        """댓글 생성 및 게시글 댓글 수 증가

        Args:
            post: Post 객체
            user: User 객체
            content: 댓글 내용

        Returns:
            Comment: 생성된 댓글 객체
        """
        comment = Comment.objects.create(post=post, user=user, content=content)
        Post.objects.filter(id=post.id).update(comments_count=F("comments_count") + 1)
        post.refresh_from_db()
        return comment

    @staticmethod
    @transaction.atomic
    def delete_comment(comment):
        """댓글 소프트 삭제 및 게시글 댓글 수 감소

        Args:
            comment: Comment 객체

        Returns:
            bool: 삭제 성공 여부
        """
        post = comment.post
        comment.is_active = False
        comment.save()
        Post.objects.filter(id=post.id).update(comments_count=F("comments_count") - 1)
        post.refresh_from_db()
        return True

    @staticmethod
    @transaction.atomic
    def create_post_with_travel_course(user, travel_course, content):
        """여행 코스와 함께 게시글 생성

        Args:
            user: User 객체
            travel_course: TravelCourse 객체
            content: 게시글 내용

        Returns:
            Post: 생성된 게시글 객체

        Raises:
            ValueError: 이미 공유된 여행 코스인 경우
        """
        existing_post = Post.objects.filter(
            user=user, travel_course=travel_course, is_active=True
        ).first()

        if existing_post:
            raise ValueError("이미 공유된 여행 코스입니다.")

        return Post.objects.create(
            user=user, travel_course=travel_course, content=content
        )

    @staticmethod
    def get_post_with_related_data(post_id):
        """관련 데이터를 포함한 게시글 조회

        Args:
            post_id: 게시글 ID

        Returns:
            Post: 게시글 객체 (관련 데이터 포함)
        """
        return get_object_or_404(
            Post.objects.select_related("user", "travel_course")
            .prefetch_related("comments__user", "likes__user")
            .filter(is_active=True),
            id=post_id,
        )

    @staticmethod
    def get_posts_queryset():
        """게시글 목록 조회용 QuerySet 반환

        Returns:
            QuerySet: 최적화된 게시글 QuerySet
        """
        return (
            Post.objects.filter(is_active=True)
            .select_related("user", "travel_course")
            .prefetch_related("comments__user")
        )

    @staticmethod
    def get_comments_queryset(post_id):
        """특정 게시글의 댓글 목록 조회용 QuerySet 반환

        Args:
            post_id: 게시글 ID

        Returns:
            QuerySet: 최적화된 댓글 QuerySet
        """
        return (
            Comment.objects.filter(post_id=post_id, is_active=True)
            .select_related("user")
            .order_by("created_at")
        )

    @staticmethod
    def is_post_liked_by_user(post, user):
        """사용자가 게시글에 좋아요를 눌렀는지 확인

        Args:
            post: Post 객체
            user: User 객체

        Returns:
            bool: 좋아요 여부
        """
        if not user.is_authenticated:
            return False
        return Like.objects.filter(post=post, user=user).exists()

    @staticmethod
    def get_user_posts(user, include_inactive=False):
        """특정 사용자의 게시글 목록 조회

        Args:
            user: User 객체
            include_inactive: 비활성 게시글 포함 여부

        Returns:
            QuerySet: 사용자 게시글 QuerySet
        """
        queryset = Post.objects.filter(user=user)
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        return (
            queryset.select_related("user", "travel_course")
            .prefetch_related("comments__user")
            .order_by("-created_at")
        )

    @staticmethod
    def get_posts_by_travel_course(travel_course):
        """특정 여행 코스 관련 게시글 목록 조회

        Args:
            travel_course: TravelCourse 객체

        Returns:
            QuerySet: 여행 코스 관련 게시글 QuerySet
        """
        return (
            Post.objects.filter(travel_course=travel_course, is_active=True)
            .select_related("user", "travel_course")
            .prefetch_related("comments__user")
            .order_by("-created_at")
        )
