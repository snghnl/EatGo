"""
Community services - handles all business logic for community features
"""

from django.db import transaction
from typing import Dict, List, Optional
from .models import Post, PostImage, Comment, Like
from accounts.models import User
from travel_courses.models import TravelCourse


def post_create(
    *,
    user: User,
    title: str,
    content: str,
    travel_course: Optional[TravelCourse] = None,
    images: Optional[List[Dict]] = None,
) -> Post:
    """
    Create a new community post.

    Args:
        user: The user creating the post
        title: Post title
        content: Post content
        travel_course: Optional travel course to attach
        images: Optional list of image data [{"url": str, "sequence": int, "alt_text": str}]

    Returns:
        Created Post instance
    """
    with transaction.atomic():
        post = Post(
            user=user, title=title, content=content, travel_course=travel_course
        )
        post.full_clean()
        post.save()

        # Create associated images
        if images:
            for image_data in images:
                post_image = PostImage(
                    post=post,
                    url=image_data["url"],
                    sequence=image_data.get("sequence", 0),
                    alt_text=image_data.get("alt_text", ""),
                )
                post_image.full_clean()
                post_image.save()

        return post


def post_update(
    *,
    post: Post,
    title: Optional[str] = None,
    content: Optional[str] = None,
    images: Optional[List[Dict]] = None,
) -> Post:
    """
    Update an existing post.

    Args:
        post: Post instance to update
        title: New title (optional)
        content: New content (optional)
        images: New images list (optional, will replace existing images)

    Returns:
        Updated Post instance
    """
    with transaction.atomic():
        if title is not None:
            post.title = title
        if content is not None:
            post.content = content

        post.full_clean()
        post.save()

        # Update images if provided
        if images is not None:
            # Remove existing images
            post.images.all().delete()

            # Create new images
            for image_data in images:
                post_image = PostImage(
                    post=post,
                    url=image_data["url"],
                    sequence=image_data.get("sequence", 0),
                    alt_text=image_data.get("alt_text", ""),
                )
                post_image.full_clean()
                post_image.save()

        return post


def post_delete(*, post: Post) -> None:
    """
    Delete a post and all its associated data.

    Args:
        post: Post instance to delete
    """
    post.delete()


def comment_create(*, user: User, post: Post, content: str) -> Comment:
    """
    Create a new comment on a post.

    Args:
        user: The user creating the comment
        post: The post to comment on
        content: Comment content

    Returns:
        Created Comment instance
    """
    with transaction.atomic():
        comment = Comment(user=user, post=post, content=content)
        comment.full_clean()
        comment.save()

        # Update comments count
        post.comments_count = post.comments.count()
        post.save(update_fields=["comments_count"])

        return comment


def comment_update(*, comment: Comment, content: str) -> Comment:
    """
    Update a comment.

    Args:
        comment: Comment instance to update
        content: New content

    Returns:
        Updated Comment instance
    """
    comment.content = content
    comment.full_clean()
    comment.save()
    return comment


def comment_delete(*, comment: Comment) -> None:
    """
    Delete a comment and update post comments count.

    Args:
        comment: Comment instance to delete
    """
    with transaction.atomic():
        post = comment.post
        comment.delete()

        # Update comments count
        post.comments_count = post.comments.count()
        post.save(update_fields=["comments_count"])


def post_like_toggle(*, user: User, post: Post) -> Dict[str, bool]:
    """
    Toggle like status for a post.

    Args:
        user: The user toggling the like
        post: The post to like/unlike

    Returns:
        Dict with 'liked' status (True if now liked, False if unliked)
    """
    with transaction.atomic():
        like, created = Like.objects.get_or_create(user=user, post=post, defaults={})

        if created:
            # Like was created
            liked = True
        else:
            # Like already existed, so remove it
            like.delete()
            liked = False

        # Update likes count
        post.likes_count = post.likes.count()
        post.save(update_fields=["likes_count"])

        return {"liked": liked}
