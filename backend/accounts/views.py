import requests
import os
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, UserDetailSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.db import transaction


class MeView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailSerializer

    def get(self, request):
        user = request.user
        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SignupView(CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # JWT 토큰 생성
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "회원가입이 완료되었습니다.",
                    "user": UserDetailSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class KakaoLoginView(APIView):
    """
    카카오 소셜 로그인 처리
    """

    def post(self, request):
        auth_code = request.data.get("code")

        if not auth_code:
            return Response(
                {"error": "인가 코드가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST
            )

        print(f"🔑 받은 인가 코드: {auth_code}")

        try:
            # 1. 카카오 액세스 토큰 획득
            kakao_token_info = self.get_kakao_token(auth_code)
            if not kakao_token_info:
                return Response(
                    {"error": "카카오 토큰 획득에 실패했습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 2. 카카오 사용자 정보 획득
            kakao_user_info = self.get_kakao_user_info(kakao_token_info["access_token"])
            if not kakao_user_info:
                return Response(
                    {"error": "카카오 사용자 정보 획득에 실패했습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 3. 사용자 생성 또는 조회
            user = self.get_or_create_kakao_user(kakao_user_info)

            # 4. JWT 토큰 생성
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "카카오 로그인이 완료되었습니다.",
                    "user": UserDetailSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"카카오 로그인 처리 중 오류가 발생했습니다: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_kakao_token(self, auth_code):
        """
        카카오 인가 코드로 액세스 토큰 획득
        """
        url = "https://kauth.kakao.com/oauth/token"
        # 개발 환경에서 다양한 redirect_uri 지원
        redirect_uri = "http://localhost:8000/api/v1/auth/kakao/callback/"
        # 안드로이드 에뮬레이터 지원
        if "10.0.2.2" in self.request.META.get("HTTP_HOST", ""):
            redirect_uri = "http://10.0.2.2:8000/api/v1/auth/kakao/callback/"

        data = {
            "grant_type": "authorization_code",
            "client_id": os.environ.get("KAKAO_REST_API_KEY"),
            "redirect_uri": redirect_uri,
            "code": auth_code,
        }

        print(f"🌐 카카오 토큰 요청 URL: {url}")
        print(f"📝 요청 데이터: {data}")

        response = requests.post(url, data=data)
        print(f"📡 카카오 응답 상태: {response.status_code}")
        print(f"📄 카카오 응답 내용: {response.text}")

        if response.status_code == 200:
            return response.json()
        return None

    def get_kakao_user_info(self, access_token):
        """
        카카오 액세스 토큰으로 사용자 정보 획득
        """
        url = "https://kapi.kakao.com/v2/user/me"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        }

        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

    @transaction.atomic
    def get_or_create_kakao_user(self, kakao_user_info):
        """
        카카오 사용자 정보로 User 생성 또는 조회
        """
        kakao_id = str(kakao_user_info["id"])
        kakao_account = kakao_user_info.get("kakao_account", {})
        profile = kakao_account.get("profile", {})

        # 카카오 ID로 기존 사용자 조회
        try:
            user = User.objects.get(username=f"kakao_{kakao_id}")
            return user
        except User.DoesNotExist:
            pass

        # 새 사용자 생성
        username = f"kakao_{kakao_id}"
        email = kakao_account.get("email", f"{username}@kakao.local")

        user = User.objects.create(
            username=username,
            email=email,
            login_method="kakao",
            profile_image_url=profile.get("profile_image_url", ""),
            first_name=profile.get("nickname", ""),
        )

        return user


class KakaoCallbackView(APIView):
    """
    카카오 OAuth 콜백 처리 (웹뷰용)
    """

    def get(self, request):
        # 웹뷰에서 인가 코드를 받기 위한 콜백
        # 실제 처리는 프론트엔드에서 JavaScript로 처리
        return Response(
            {
                "message": "카카오 콜백 페이지입니다. 이 페이지는 앱에서 자동으로 처리됩니다."
            }
        )


class GoogleLoginView(APIView):
    """
    구글 소셜 로그인 처리
    """

    def post(self, request):
        auth_code = request.data.get("code")

        if not auth_code:
            return Response(
                {"error": "인가 코드가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST
            )

        print(f"🔑 받은 구글 인가 코드: {auth_code}")

        try:
            # 1. 구글 액세스 토큰 획득
            google_token_info = self.get_google_token(auth_code)
            if not google_token_info:
                return Response(
                    {"error": "구글 토큰 획득에 실패했습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 2. 구글 사용자 정보 획득
            google_user_info = self.get_google_user_info(
                google_token_info["access_token"]
            )
            if not google_user_info:
                return Response(
                    {"error": "구글 사용자 정보 획득에 실패했습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 3. 사용자 생성 또는 조회
            user = self.get_or_create_google_user(google_user_info)

            # 4. JWT 토큰 생성
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "구글 로그인이 완료되었습니다.",
                    "user": UserDetailSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"구글 로그인 처리 중 오류가 발생했습니다: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_google_token(self, auth_code):
        """
        구글 인가 코드로 액세스 토큰 획득
        """
        url = "https://oauth2.googleapis.com/token"
        # OAuth 인증 시 사용한 것과 동일한 redirect_uri 사용 (항상 localhost)
        redirect_uri = "http://localhost:8000/api/v1/auth/google/callback/"

        data = {
            "grant_type": "authorization_code",
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": redirect_uri,
            "code": auth_code,
        }

        print(f"🌐 구글 토큰 요청 URL: {url}")
        print(f"📝 요청 데이터: {data}")

        response = requests.post(url, data=data)
        print(f"📡 구글 응답 상태: {response.status_code}")
        print(f"📄 구글 응답 내용: {response.text}")

        if response.status_code == 200:
            return response.json()
        return None

    def get_google_user_info(self, access_token):
        """
        구글 액세스 토큰으로 사용자 정보 획득
        """
        url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {
            "Authorization": f"Bearer {access_token}",
        }

        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

    @transaction.atomic
    def get_or_create_google_user(self, google_user_info):
        """
        구글 사용자 정보로 User 생성 또는 조회
        """
        google_id = str(google_user_info["id"])
        email = google_user_info.get("email", "")
        name = google_user_info.get("name", "")
        picture = google_user_info.get("picture", "")

        # 구글 ID로 기존 사용자 조회
        try:
            user = User.objects.get(username=f"google_{google_id}")
            return user
        except User.DoesNotExist:
            pass

        # 이메일로 기존 사용자 조회
        try:
            user = User.objects.get(email=email)
            # 기존 사용자가 있다면 구글 로그인 방식 추가
            user.username = f"google_{google_id}"
            user.login_method = "google"
            user.profile_image_url = picture
            user.save()
            return user
        except User.DoesNotExist:
            pass

        # 새 사용자 생성
        username = f"google_{google_id}"

        user = User.objects.create(
            username=username,
            email=email,
            login_method="google",
            profile_image_url=picture,
            first_name=name,
        )

        return user


class GoogleCallbackView(APIView):
    """
    구글 OAuth 콜백 처리 (웹뷰용)
    """

    def get(self, request):
        # 웹뷰에서 인가 코드를 받기 위한 콜백
        # 실제 처리는 프론트엔드에서 JavaScript로 처리
        return Response(
            {
                "message": "구글 콜백 페이지입니다. 이 페이지는 앱에서 자동으로 처리됩니다."
            }
        )
