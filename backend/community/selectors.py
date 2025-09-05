"""
Community selectors - handles all read operations for community features
"""

from django.db.models import QuerySet, Prefetch, Q
from typing import Optional, Dict, Any
from .models import Post, Comment, Like
from accounts.models import User
from travel_courses.models import TravelCourse


def post_list(
    *,
    user: Optional[User] = None,
    travel_course: Optional[TravelCourse] = None,
    search: Optional[str] = None,
    filters: Optional[Dict[str, Any]] = None,
) -> QuerySet[Post]:
    """
    Get a queryset of posts with proper prefetching.

    Args:
        user: Filter by specific user (optional)
        travel_course: Filter by specific travel course (optional)
        search: Search in title and content (optional)
        filters: Additional filters (optional)

    Returns:
        Optimized QuerySet of Post instances
    """
    qs = Post.objects.select_related("user", "travel_course").prefetch_related(
        "images",
        Prefetch(
            "comments",
            queryset=Comment.objects.select_related("user").order_by("created_at"),
        ),
    )

    if user is not None:
        qs = qs.filter(user=user)

    if travel_course is not None:
        qs = qs.filter(travel_course=travel_course)

    if search:
        qs = qs.filter(Q(title__icontains=search) | Q(content__icontains=search))

    if filters:
        qs = qs.filter(**filters)

    return qs.order_by("-created_at")


def post_detail(*, post_id: str, user: Optional[User] = None) -> Post:
    """
    Get a single post with all related data.

    Args:
        post_id: UUID of the post
        user: Current user (for like status)

    Returns:
        Post instance with prefetched data

    Raises:
        Post.DoesNotExist: If post not found
    """
    post = (
        Post.objects.select_related("user", "travel_course")
        .prefetch_related(
            "images",
            Prefetch(
                "comments",
                queryset=Comment.objects.select_related("user").order_by("created_at"),
            ),
            "likes",
        )
        .get(id=post_id)
    )

    return post


def post_is_liked_by_user(*, post: Post, user: User) -> bool:
    """
    Check if a post is liked by a specific user.

    Args:
        post: Post instance
        user: User instance

    Returns:
        True if post is liked by user, False otherwise
    """
    if not hasattr(user, "is_authenticated") or not user.is_authenticated:
        return False

    return post.likes.filter(user=user).exists()


def post_comments_list(*, post: Post) -> QuerySet[Comment]:
    """
    Get all comments for a post.

    Args:
        post: Post instance

    Returns:
        QuerySet of Comment instances
    """
    return post.comments.select_related("user").order_by("created_at")


def post_likes_list(*, post: Post) -> QuerySet[Like]:
    """
    Get all likes for a post.

    Args:
        post: Post instance

    Returns:
        QuerySet of Like instances
    """
    return post.likes.select_related("user").order_by("-created_at")


def user_posts_list(*, user: User) -> QuerySet[Post]:
    """
    Get all posts by a specific user.

    Args:
        user: User instance

    Returns:
        QuerySet of Post instances
    """
    return post_list(user=user)


def travel_course_posts_list(*, travel_course: TravelCourse) -> QuerySet[Post]:
    """
    Get all posts related to a specific travel course.

    Args:
        travel_course: TravelCourse instance

    Returns:
        QuerySet of Post instances
    """
    return post_list(travel_course=travel_course)


def comment_detail(*, comment_id: str) -> Comment:
    """
    Get a single comment with user data.

    Args:
        comment_id: UUID of the comment

    Returns:
        Comment instance with prefetched data

    Raises:
        Comment.DoesNotExist: If comment not found
    """
    return Comment.objects.select_related("user", "post").get(id=comment_id)
