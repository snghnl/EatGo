from django.urls import path
from .views import KakaoLoginView, KakaoCallbackView
from .google_views import GoogleLoginView, GoogleCallbackView

app_name = "accounts"

urlpatterns = [
    # 소셜 로그인
    path("kakao/login/", KakaoLoginView.as_view(), name="kakao_login"),
    path("kakao/callback/", KakaoCallbackView.as_view(), name="kakao_callback"),
    path("google/login/", GoogleLoginView.as_view(), name="google_login"),
    path("google/callback/", GoogleCallbackView.as_view(), name="google_callback"),
    # 나머지는 다른 팀원이 작업 중이므로 임시 주석 처리
    # path('register/', RegisterView.as_view(), name='register'),
    # path('login/', LoginView.as_view(), name='login'),
    # path('logout/', logout_view, name='logout'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('profile/', ProfileView.as_view(), name='profile'),
]
