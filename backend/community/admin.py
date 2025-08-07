from django.contrib import admin
from .models import Post, Comment, Like


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "content_preview",
        "travel_course",
        "likes_count",
        "comments_count",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "created_at", "travel_course"]
    search_fields = ["content", "user__username"]
    readonly_fields = ["likes_count", "comments_count", "created_at", "updated_at"]
    list_per_page = 20

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content Preview"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "post_preview",
        "content_preview",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "created_at"]
    search_fields = ["content", "user__username", "post__content"]
    readonly_fields = ["created_at", "updated_at"]
    list_per_page = 20

    def content_preview(self, obj):
        return obj.content[:30] + "..." if len(obj.content) > 30 else obj.content

    content_preview.short_description = "Content Preview"

    def post_preview(self, obj):
        return (
            obj.post.content[:30] + "..."
            if len(obj.post.content) > 30
            else obj.post.content
        )

    post_preview.short_description = "Post Preview"


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "post_preview", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "post__content"]
    readonly_fields = ["created_at", "updated_at"]
    list_per_page = 20

    def post_preview(self, obj):
        return (
            obj.post.content[:40] + "..."
            if len(obj.post.content) > 40
            else obj.post.content
        )

    post_preview.short_description = "Post Preview"
