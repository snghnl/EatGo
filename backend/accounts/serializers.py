from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password_confirm", "login_method")
        extra_kwargs = {"login_method": {"default": "email"}}

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "login_method",
            "profile_image_url",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information.
    Allows updating username and profile_image_url only.
    """

    class Meta:
        model = User
        fields = ("username", "profile_image_url")

    def validate_username(self, value):
        """
        Validate that username is unique (excluding current user).
        """
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("이미 사용 중인 사용자명입니다.")
        return value
