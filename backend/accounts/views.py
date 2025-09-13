from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserDetailSerializer, UserUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class MeView(RetrieveUpdateAPIView):
    """
    Retrieve and update the authenticated user's profile.

    GET: Returns user profile information
    PATCH: Updates user profile (username, profile_image_url)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserUpdateSerializer
        return UserDetailSerializer

    def patch(self, request, *args, **kwargs):
        """
        Update user profile information.
        """
        try:
            user = self.get_object()
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                updated_user = serializer.save()

                # Log the profile update
                logger.info(
                    f"Profile updated for user: {updated_user.username} (ID: {updated_user.id})"
                )

                # Return updated user data using the detail serializer
                response_serializer = UserDetailSerializer(updated_user)
                return Response(
                    {
                        "message": "프로필이 성공적으로 업데이트되었습니다.",
                        "user": response_serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(
                f"Failed to update profile for user: {request.user.username}. Error: {str(e)}"
            )
            return Response(
                {
                    "error": "프로필 업데이트 중 오류가 발생했습니다.",
                    "detail": "잠시 후 다시 시도해주세요.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


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


class DeleteAccountView(APIView):
    """
    Delete the authenticated user's account and all related data.

    This is a destructive operation that:
    1. Deletes all user-related data (posts, routes, travel courses, preferences)
    2. Permanently deletes the user account
    3. Cannot be undone

    Requires authentication and will delete the currently logged-in user.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        """
        Delete the current user's account and all related data.
        """
        user = request.user

        try:
            with transaction.atomic():
                # Log the account deletion attempt
                logger.info(
                    f"Account deletion requested for user: {user.username} (ID: {user.id})"
                )

                # Get user data for logging before deletion
                username = user.username
                user_id = user.id

                # Delete the user (CASCADE will handle related objects)
                # Django's CASCADE will automatically delete:
                # - UserPreference objects
                # - Community posts (if author FK has CASCADE)
                # - Routes (if user FK has CASCADE)
                # - Travel courses (if user FK has CASCADE)
                # - Any other related objects with CASCADE delete
                user.delete()

                # Log successful deletion
                logger.info(
                    f"Account successfully deleted for user: {username} (ID: {user_id})"
                )

                return Response(
                    {
                        "message": "계정이 성공적으로 삭제되었습니다.",
                        "detail": "모든 관련 데이터가 영구적으로 삭제되었습니다.",
                    },
                    status=status.HTTP_204_NO_CONTENT,
                )

        except Exception as e:
            # Log the error
            logger.error(
                f"Failed to delete account for user: {user.username} (ID: {user.id}). Error: {str(e)}"
            )

            return Response(
                {
                    "error": "계정 삭제 중 오류가 발생했습니다.",
                    "detail": "잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터에 문의해주세요.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
