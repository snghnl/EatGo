from django.urls import path
from .views import (
    KakaoKeywordSearchView,
    KakaoCategorySearchView,
    KakaoCategoriesView,
)


urlpatterns = [
    path(
        "kakao/search/keyword/",
        KakaoKeywordSearchView.as_view(),
        name="kakao-keyword-search",
    ),
    path(
        "kakao/search/category/",
        KakaoCategorySearchView.as_view(),
        name="kakao-category-search",
    ),
    path("kakao/categories/", KakaoCategoriesView.as_view(), name="kakao-categories"),
]
