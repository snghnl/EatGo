import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from django.http import HttpResponse

User = get_user_model()


class GoogleLoginView(APIView):
    """
    구글 소셜 로그인 API
    POST /auth/google/login/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token")
        code = request.data.get("code")
        redirect_uri = request.data.get("redirect_uri")

        try:
            # Authorization Code 방식
            if code and redirect_uri:
                access_token = self._get_access_token_from_code(code, redirect_uri)
            elif not access_token:
                return Response(
                    {"error": "구글 액세스 토큰 또는 authorization code가 필요합니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 구글 사용자 정보 조회
            google_user_info = self._get_google_user_info(access_token)

            # 사용자 조회 또는 생성
            user, created = self._get_or_create_user(google_user_info)

            # JWT 토큰 생성
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "구글 회원가입이 완료되었습니다"
                    if created
                    else "구글 로그인 성공",
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "login_method": user.login_method,
                        "profile_image_url": user.profile_image_url,
                    },
                    "created": created,
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"구글 로그인 실패: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _get_access_token_from_code(self, code, redirect_uri):
        """Authorization Code로 Access Token 획득"""
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "grant_type": "authorization_code",
            "client_id": getattr(settings, "GOOGLE_CLIENT_ID", ""),
            "client_secret": getattr(settings, "GOOGLE_CLIENT_SECRET", ""),
            "code": code,
            "redirect_uri": redirect_uri,
        }

        response = requests.post(token_url, data=token_data, timeout=10)

        if response.status_code != 200:
            raise Exception(f"구글 토큰 획득 실패: {response.status_code}")

        token_data = response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise Exception("구글 액세스 토큰을 받지 못했습니다.")

        return access_token

    def _get_google_user_info(self, access_token):
        """구글 API로 사용자 정보 조회"""
        headers = {
            "Authorization": f"Bearer {access_token}",
        }

        response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo", headers=headers, timeout=10
        )

        if response.status_code != 200:
            raise Exception(f"구글 API 호출 실패: {response.status_code}")

        return response.json()

    def _get_or_create_user(self, google_user_info):
        """구글 사용자 정보로 계정 조회 또는 생성"""
        print(f"구글 사용자 정보: {google_user_info}")  # 디버깅용

        google_id = str(google_user_info.get("id"))
        if not google_id:
            raise Exception("구글 사용자 ID를 찾을 수 없습니다.")

        # 계정 정보 추출
        email = google_user_info.get("email")
        picture = google_user_info.get("picture")

        # 구글 ID로 기존 계정 확인 (username에 google_id 포함시켜서 구분)
        google_username = f"google_{google_id}"
        try:
            existing_user = User.objects.get(username=google_username)
            # 기존 사용자 정보 업데이트
            if email:
                existing_user.email = email
            if picture:
                existing_user.profile_image_url = picture
            existing_user.save()
            return existing_user, False
        except User.DoesNotExist:
            pass

        # 새 계정 생성
        user = User.objects.create_user(
            username=google_username,
            email=email,
            login_method="google",
            profile_image_url=picture,
        )
        return user, True


class GoogleCallbackView(APIView):
    """
    구글 OAuth callback 처리 API
    GET /oauth/google/callback/?code=XXXX
    """

    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        error = request.GET.get("error")

        if error:
            return Response(
                {"error": f"구글 인증 오류: {error}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not code:
            return Response(
                {"error": "Authorization code가 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Authorization code로 access token 획득 후 사용자 생성/로그인
            access_token = self._get_access_token_from_code(
                code, request.build_absolute_uri()
            )
            google_user_info = self._get_google_user_info(access_token)
            user, created = self._get_or_create_user(google_user_info)

            # JWT 토큰 생성
            refresh = RefreshToken.for_user(user)

            # 앱으로 리다이렉트 (딥링크 사용)
            app_scheme = "eatgo"  # app.json에서 설정한 scheme
            success_url = f"{app_scheme}://oauth/success?access_token={str(refresh.access_token)}&refresh_token={str(refresh)}&created={created}"

            # 웹 페이지로 자동 리다이렉트하는 HTML 반환
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>구글 로그인 성공</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1>로그인 {"회원가입" if created else "로그인"} 성공!</h1>
                <p>앱으로 이동 중...</p>
                <script>
                    setTimeout(() => {{
                        window.location.href = '{success_url}';
                    }}, 1000);
                </script>
            </body>
            </html>
            """

            return HttpResponse(html_content, content_type="text/html")

        except Exception as e:
            return Response(
                {"error": f"구글 로그인 실패: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _get_access_token_from_code(self, code, redirect_uri):
        """Authorization Code로 Access Token 획득"""
        token_url = "https://oauth2.googleapis.com/token"
        # redirect_uri는 원래 요청 시 사용한 정확한 URI 사용
        original_redirect_uri = (
            "https://7edfd67b542c.ngrok-free.app/api/v1/auth/google/callback/"
        )

        token_data = {
            "grant_type": "authorization_code",
            "client_id": getattr(settings, "GOOGLE_CLIENT_ID", ""),
            "client_secret": getattr(settings, "GOOGLE_CLIENT_SECRET", ""),
            "code": code,
            "redirect_uri": original_redirect_uri,
        }

        response = requests.post(token_url, data=token_data, timeout=10)

        if response.status_code != 200:
            error_detail = response.text
            print(f"구글 토큰 요청 실패: {response.status_code}, 응답: {error_detail}")
            print(f"요청 데이터: {token_data}")
            raise Exception(
                f"구글 토큰 획득 실패: {response.status_code} - {error_detail}"
            )

        token_response_data = response.json()
        access_token = token_response_data.get("access_token")

        if not access_token:
            raise Exception("구글 액세스 토큰을 받지 못했습니다.")

        return access_token

    def _get_google_user_info(self, access_token):
        """구글 API로 사용자 정보 조회"""
        headers = {
            "Authorization": f"Bearer {access_token}",
        }

        response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo", headers=headers, timeout=10
        )

        if response.status_code != 200:
            raise Exception(f"구글 API 호출 실패: {response.status_code}")

        return response.json()

    def _get_or_create_user(self, google_user_info):
        """구글 사용자 정보로 계정 조회 또는 생성"""
        print(f"구글 사용자 정보: {google_user_info}")  # 디버깅용

        google_id = str(google_user_info.get("id"))
        if not google_id:
            raise Exception("구글 사용자 ID를 찾을 수 없습니다.")

        # 계정 정보 추출
        email = google_user_info.get("email")
        picture = google_user_info.get("picture")

        # 구글 ID로 기존 계정 확인 (username에 google_id 포함시켜서 구분)
        google_username = f"google_{google_id}"
        try:
            existing_user = User.objects.get(username=google_username)
            # 기존 사용자 정보 업데이트
            if email:
                existing_user.email = email
            if picture:
                existing_user.profile_image_url = picture
            existing_user.save()
            return existing_user, False
        except User.DoesNotExist:
            pass

        # 새 계정 생성
        user = User.objects.create_user(
            username=google_username,
            email=email,
            login_method="google",
            profile_image_url=picture,
        )
        return user, True
