from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .services import TourismAPIService, POIRecommendationService
from .serializers import (
    TourismPOISerializer,
    RelatedTourismSerializer,
    POIRecommendationRequestSerializer,
    POIRecommendationResponseSerializer,
    RelatedPOIRequestSerializer,
    RelatedPOIResponseSerializer,
    RegionalTourismRequestSerializer,
)
from .models import TourismPOI, RelatedTourism


class TourismPOIViewSet(viewsets.ReadOnlyModelViewSet):
    """
    관광지 POI 정보 조회 ViewSet
    """

    queryset = TourismPOI.objects.all()
    serializer_class = TourismPOISerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """쿼리셋 필터링"""
        queryset = TourismPOI.objects.all()

        # 필터링
        area_cd = self.request.query_params.get("area_cd")
        signgu_cd = self.request.query_params.get("signgu_cd")
        category = self.request.query_params.get("category")

        if area_cd:
            queryset = queryset.filter(area_cd=area_cd)
        if signgu_cd:
            queryset = queryset.filter(signgu_cd=signgu_cd)
        if category:
            queryset = queryset.filter(hub_ctgry_lcls_nm__icontains=category)

        # 정렬 (순위순)
        return queryset.order_by("hub_rank", "hub_tats_nm")

    def get_object(self):
        """POI ID로 객체 조회 (hub_tats_cd 사용)"""
        poi_id = self.kwargs.get("pk")
        return get_object_or_404(TourismPOI, hub_tats_cd=poi_id)


class RelatedTourismViewSet(viewsets.ReadOnlyModelViewSet):
    """
    연관 관광지 정보 조회 ViewSet
    """

    queryset = RelatedTourism.objects.all()
    serializer_class = RelatedTourismSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """쿼리셋 필터링"""
        queryset = RelatedTourism.objects.all()

        # 필터링
        base_tats_nm = self.request.query_params.get("base_tats_nm")
        if base_tats_nm:
            queryset = queryset.filter(base_tats_nm__icontains=base_tats_nm)

        # 정렬 (순위순)
        return queryset.order_by("rite_rank", "rite_tats_nm")


class TourismRecommendationViewSet(viewsets.GenericViewSet):
    """
    관광지 추천 관련 ViewSet
    """

    permission_classes = [AllowAny]

    def get_serializer_class(self):
        """액션에 따른 serializer 클래스 반환"""
        if self.action == "recommend":
            return POIRecommendationRequestSerializer
        elif self.action == "related":
            return RelatedPOIRequestSerializer
        return POIRecommendationRequestSerializer

    @action(detail=False, methods=["post"])
    def recommend(self, request):
        """
        사용자 위치 기반 POI 추천 API

        POST /api/tourism/recommendation/recommend/
        {
            "latitude": 37.5665,
            "longitude": 126.9780,
            "radius_km": 10.0,
            "max_results": 20
        }
        """
        try:
            # 요청 데이터 검증
            serializer = POIRecommendationRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # 추천 서비스 호출
            recommendation_service = POIRecommendationService()
            recommended_pois = recommendation_service.get_recommended_pois(
                latitude=serializer.validated_data["latitude"],
                longitude=serializer.validated_data["longitude"],
                radius_km=serializer.validated_data.get("radius_km", 10.0),
                user_id=request.user.id if request.user.is_authenticated else None,
                max_results=serializer.validated_data.get("max_results", 20),
            )

            # 응답 데이터 검증
            response_serializer = POIRecommendationResponseSerializer(
                recommended_pois, many=True
            )

            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "count": len(recommended_pois),
                    "message": f"{len(recommended_pois)}개의 관광지를 추천했습니다.",
                }
            )

        except ValidationError as e:
            return Response(
                {
                    "success": False,
                    "error": "입력 데이터가 올바르지 않습니다.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "error": "추천 서비스 처리 중 오류가 발생했습니다.",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def related(self, request):
        """
        특정 POI의 연관 관광지 조회 API

        POST /api/tourism/recommendation/related/
        {
            "poi_name": "관광지명",
            "area_cd": "11",
            "signgu_cd": "11530"
        }
        """
        try:
            # 요청 데이터 검증
            serializer = RelatedPOIRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # 연관 관광지 조회
            recommendation_service = POIRecommendationService()
            related_pois = recommendation_service.get_related_pois(
                poi_name=serializer.validated_data["poi_name"],
                area_cd=serializer.validated_data["area_cd"],
                signgu_cd=serializer.validated_data["signgu_cd"],
            )

            # 응답 데이터 검증
            response_serializer = RelatedPOIResponseSerializer(related_pois, many=True)

            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "count": len(related_pois),
                    "message": f"{len(related_pois)}개의 연관 관광지를 찾았습니다.",
                }
            )

        except ValidationError as e:
            return Response(
                {
                    "success": False,
                    "error": "입력 데이터가 올바르지 않습니다.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "error": "연관 관광지 조회 중 오류가 발생했습니다.",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TourismAPIViewSet(viewsets.GenericViewSet):
    """
    한국관광공사 API 연동 ViewSet
    """

    permission_classes = [AllowAny]

    def get_serializer_class(self):
        """액션에 따른 serializer 클래스 반환"""
        return RegionalTourismRequestSerializer

    @action(detail=False, methods=["post"])
    def regional(self, request):
        """
        지역별 관광지 정보 조회 API

        POST /api/tourism/api/regional/
        {
            "area_cd": "11",
            "signgu_cd": "11530",
            "base_ym": "202404",
            "num_of_rows": 20,
            "page_no": 1
        }
        """
        try:
            # 요청 데이터 검증
            serializer = RegionalTourismRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # API 서비스 호출
            tourism_service = TourismAPIService()
            tourism_data = tourism_service.get_regional_tourism_data(
                area_cd=serializer.validated_data["area_cd"],
                signgu_cd=serializer.validated_data["signgu_cd"],
                base_ym=serializer.validated_data.get("base_ym"),
            )

            return Response(
                {
                    "success": True,
                    "data": tourism_data,
                    "count": len(tourism_data),
                    "message": f"{len(tourism_data)}개의 관광지 정보를 조회했습니다.",
                }
            )

        except ValidationError as e:
            return Response(
                {
                    "success": False,
                    "error": "입력 데이터가 올바르지 않습니다.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "error": "지역 관광지 조회 중 오류가 발생했습니다.",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
