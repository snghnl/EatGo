from django.urls import path
from .views import (
    MeView,
    SignupView,
    KakaoLoginView,
    KakaoCallbackView,
    GoogleLoginView,
    GoogleCallbackView,
)


urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("kakao/", KakaoLoginView.as_view(), name="kakao_login"),
    path("kakao/callback/", KakaoCallbackView.as_view(), name="kakao_callback"),
    path("google/", GoogleLoginView.as_view(), name="google_login"),
    path("google/callback/", GoogleCallbackView.as_view(), name="google_callback"),
]
