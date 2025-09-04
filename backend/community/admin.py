from django.contrib import admin
from .models import Post, PostImage, Comment, Like


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 0
    fields = ["url", "sequence", "alt_text"]
    ordering = ["sequence"]


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "user",
        "travel_course",
        "likes_count",
        "comments_count",
        "created_at",
    ]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["title", "content", "user__username"]
    readonly_fields = ["likes_count", "comments_count", "created_at", "updated_at"]
    inlines = [PostImageInline]

    fieldsets = (
        (None, {"fields": ("user", "travel_course", "title", "content")}),
        (
            "Metadata",
            {
                "fields": ("likes_count", "comments_count", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["post", "user", "content_preview", "created_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["content", "user__username", "post__title"]
    readonly_fields = ["created_at", "updated_at"]

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content Preview"


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["post", "user", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "post__title"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ["post", "sequence", "url", "created_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["post__title", "alt_text"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["post", "sequence"]
