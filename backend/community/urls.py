from django.urls import path
from . import views

app_name = "community"

urlpatterns = [
    # Post endpoints
    path("posts/", views.PostListView.as_view(), name="post-list"),
    path("posts/<uuid:post_id>/", views.PostDetailView.as_view(), name="post-detail"),
    path("posts/<uuid:post_id>/like/", views.PostLikeView.as_view(), name="post-like"),
    path(
        "posts/<uuid:post_id>/comments/",
        views.PostCommentsView.as_view(),
        name="post-comments",
    ),
    # Comment endpoints
    path(
        "comments/<uuid:comment_id>/",
        views.CommentDetailView.as_view(),
        name="comment-detail",
    ),
]
