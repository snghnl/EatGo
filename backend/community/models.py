import uuid
from django.db import models
from django.conf import settings
from core.models import BaseModel


class Post(BaseModel):
    """
    Community post model representing user-generated content.
    Can optionally reference a travel course.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="posts",
        on_delete=models.CASCADE,
        verbose_name="Author",
    )
    travel_course = models.ForeignKey(
        "travel_courses.TravelCourse",
        related_name="posts",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Referenced Travel Course",
    )
    title = models.CharField(max_length=255, verbose_name="Post Title")
    content = models.TextField(verbose_name="Post Content")
    likes_count = models.PositiveIntegerField(default=0, verbose_name="Likes Count")
    comments_count = models.PositiveIntegerField(
        default=0, verbose_name="Comments Count"
    )

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        db_table = "posts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class PostImage(BaseModel):
    """
    Images associated with community posts.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post, related_name="images", on_delete=models.CASCADE, verbose_name="Post"
    )
    url = models.URLField(
        max_length=500,
        verbose_name="Image URL",
        help_text="Image storage path or CDN URL",
    )
    sequence = models.PositiveIntegerField(
        default=0,
        verbose_name="Image Sequence",
        help_text="Order of images in the post",
    )
    alt_text = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Alternative Text",
        help_text="Alternative text for accessibility",
    )

    class Meta:
        verbose_name = "Post Image"
        verbose_name_plural = "Post Images"
        db_table = "post_images"
        ordering = ["sequence"]
        constraints = [
            models.UniqueConstraint(
                fields=["post", "sequence"], name="unique_post_image_sequence"
            )
        ]

    def __str__(self):
        return f"{self.post.title} - Image {self.sequence}"


class Comment(BaseModel):
    """
    Comments on community posts.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post, related_name="comments", on_delete=models.CASCADE, verbose_name="Post"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="comments",
        on_delete=models.CASCADE,
        verbose_name="Commenter",
    )
    content = models.TextField(verbose_name="Comment Content")

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        db_table = "comments"
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment on {self.post.title} by {self.user.username}"


class Like(BaseModel):
    """
    Likes on community posts.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post, related_name="likes", on_delete=models.CASCADE, verbose_name="Post"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="likes",
        on_delete=models.CASCADE,
        verbose_name="User",
    )

    class Meta:
        verbose_name = "Like"
        verbose_name_plural = "Likes"
        db_table = "likes"
        constraints = [
            models.UniqueConstraint(fields=["post", "user"], name="unique_post_like")
        ]

    def __str__(self):
        return f"{self.user.username} likes {self.post.title}"
