import uuid
from django.db import models
from django.conf import settings
from core.models import BaseModel


class Post(BaseModel):
    """
    커뮤니티 게시글 모델
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_posts",
        verbose_name="작성자",
    )
    travel_course = models.ForeignKey(
        "travel_courses.TravelCourse",
        on_delete=models.CASCADE,
        related_name="community_posts",
        null=True,
        blank=True,
        verbose_name="여행 코스",
    )
    content = models.TextField(verbose_name="내용")
    likes_count = models.PositiveIntegerField(default=0, verbose_name="좋아요 수")
    comments_count = models.PositiveIntegerField(default=0, verbose_name="댓글 수")
    is_active = models.BooleanField(default=True, verbose_name="활성 상태")

    class Meta:
        db_table = "community_posts"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["user"]),
            models.Index(fields=["travel_course"]),
            models.Index(fields=["is_active"]),
        ]
        verbose_name = "게시글"
        verbose_name_plural = "게시글"

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."


class Comment(BaseModel):
    """
    게시글 댓글 모델
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments", verbose_name="게시글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_comments",
        verbose_name="작성자",
    )
    content = models.TextField(max_length=500, verbose_name="내용")
    is_active = models.BooleanField(default=True, verbose_name="활성 상태")

    class Meta:
        db_table = "community_comments"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["post", "created_at"]),
            models.Index(fields=["user"]),
            models.Index(fields=["is_active"]),
        ]
        verbose_name = "댓글"
        verbose_name_plural = "댓글"

    def __str__(self):
        return f"{self.user.username} on {self.post.id}: {self.content[:30]}..."


class Like(BaseModel):
    """
    게시글 좋아요 모델
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="likes", verbose_name="게시글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_likes",
        verbose_name="사용자",
    )

    class Meta:
        db_table = "community_likes"
        constraints = [
            models.UniqueConstraint(
                fields=["post", "user"], name="unique_community_post_like"
            )
        ]
        indexes = [
            models.Index(fields=["post"]),
            models.Index(fields=["user"]),
        ]
        verbose_name = "좋아요"
        verbose_name_plural = "좋아요"

    def __str__(self):
        return f"{self.user.username} likes {self.post.id}"
