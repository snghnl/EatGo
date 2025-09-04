from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema

from .models import District, Province
from .serializers import DistrictSerializer, DistrictListSerializer, ProvinceSerializer


class DistrictViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = District.objects.select_related("province").filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "list":
            return DistrictListSerializer
        return DistrictSerializer

    @swagger_auto_schema(
        operation_description="List all active districts with province information",
        responses={200: DistrictListSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a specific district with full details",
        responses={200: DistrictSerializer()},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


class ProvinceViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Province.objects.filter(is_active=True)
    serializer_class = ProvinceSerializer

    @swagger_auto_schema(
        operation_description="List all active provinces",
        responses={200: ProvinceSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a specific province",
        responses={200: ProvinceSerializer()},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
