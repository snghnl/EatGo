from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate using email address.
    This backend will check if the username provided is actually an email address,
    and if so, authenticate against the email field instead of username.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Check if username looks like an email
            if "@" in username:
                # Try to authenticate using email
                user = User.objects.get(email=username)
            else:
                # Try to authenticate using username
                user = User.objects.get(username=username)

            # Check password
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

        return None
