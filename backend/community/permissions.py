from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    객체의 소유자만 수정/삭제 가능, 읽기는 모든 사용자 가능
    """

    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 모든 요청에 허용 (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # 쓰기 권한은 객체 소유자에게만 허용
        return obj.user == request.user


class IsAuthenticated(permissions.BasePermission):
    """
    인증된 사용자만 접근 가능
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    읽기는 모든 사용자, 쓰기는 인증된 사용자만 가능
    """

    def has_permission(self, request, view):
        # 읽기 권한은 모든 요청에 허용
        if request.method in permissions.SAFE_METHODS:
            return True

        # 쓰기 권한은 인증된 사용자에게만 허용
        return bool(request.user and request.user.is_authenticated)
