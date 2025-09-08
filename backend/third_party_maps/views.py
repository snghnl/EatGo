from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .kakao_service import KakaoMapService
import logging

logger = logging.getLogger(__name__)


class KakaoKeywordSearchView(APIView):
    """API view for searching POI by keyword using Kakao Map API"""

    @swagger_auto_schema(
        operation_description="Search POI (Points of Interest) by keyword using Kakao Map API",
        manual_parameters=[
            openapi.Parameter(
                "query",
                openapi.IN_QUERY,
                description="Search keyword",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "x",
                openapi.IN_QUERY,
                description="Longitude coordinate",
                type=openapi.TYPE_NUMBER,
                required=False,
            ),
            openapi.Parameter(
                "y",
                openapi.IN_QUERY,
                description="Latitude coordinate",
                type=openapi.TYPE_NUMBER,
                required=False,
            ),
            openapi.Parameter(
                "radius",
                openapi.IN_QUERY,
                description="Search radius in meters (default: 15000)",
                type=openapi.TYPE_INTEGER,
                default=15000,
                required=False,
            ),
            openapi.Parameter(
                "page",
                openapi.IN_QUERY,
                description="Page number (default: 1)",
                type=openapi.TYPE_INTEGER,
                default=1,
                required=False,
            ),
            openapi.Parameter(
                "size",
                openapi.IN_QUERY,
                description="Number of results per page (default: 15)",
                type=openapi.TYPE_INTEGER,
                default=15,
                required=False,
            ),
            openapi.Parameter(
                "sort",
                openapi.IN_QUERY,
                description="Sort order: 'accuracy' or 'distance'",
                type=openapi.TYPE_STRING,
                default="accuracy",
                enum=["accuracy", "distance"],
                required=False,
            ),
        ],
        responses={
            200: openapi.Response(
                description="Successful search results",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "documents": openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    "id": openapi.Schema(type=openapi.TYPE_STRING),
                                    "place_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "category_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "category_group_code": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "category_group_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "phone": openapi.Schema(type=openapi.TYPE_STRING),
                                    "address_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "road_address_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "x": openapi.Schema(type=openapi.TYPE_STRING),
                                    "y": openapi.Schema(type=openapi.TYPE_STRING),
                                    "place_url": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "distance": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                },
                            ),
                        ),
                        "meta": openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                "total_count": openapi.Schema(
                                    type=openapi.TYPE_INTEGER
                                ),
                                "pageable_count": openapi.Schema(
                                    type=openapi.TYPE_INTEGER
                                ),
                                "is_end": openapi.Schema(type=openapi.TYPE_BOOLEAN),
                            },
                        ),
                    },
                ),
            ),
            400: openapi.Response(
                description="Bad Request - Missing or invalid parameters",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            500: openapi.Response(
                description="Internal Server Error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
        },
        tags=["Kakao Map API"],
    )
    def get(self, request):
        try:
            query = request.query_params.get("query")
            if not query:
                return Response(
                    {"error": "Query parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            x = request.query_params.get("x")
            y = request.query_params.get("y")
            radius = int(request.query_params.get("radius", 15000))
            page = int(request.query_params.get("page", 1))
            size = int(request.query_params.get("size", 15))
            sort = request.query_params.get("sort", "accuracy")

            if x is not None:
                x = float(x)
            if y is not None:
                y = float(y)

            kakao_service = KakaoMapService()
            results = kakao_service.search_by_keyword(
                query=query, x=x, y=y, radius=radius, page=page, size=size, sort=sort
            )

            return Response(results, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.error(f"Invalid parameter values: {str(e)}")
            return Response(
                {"error": "Invalid parameter values"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Keyword search failed: {str(e)}")
            return Response(
                {"error": "Search failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class KakaoCategorySearchView(APIView):
    """API view for searching POI by category using Kakao Map API"""

    @swagger_auto_schema(
        operation_description="Search POI by category using Kakao Map API",
        manual_parameters=[
            openapi.Parameter(
                "category_group_code",
                openapi.IN_QUERY,
                description="Category group code (e.g., MT1, CS2, PS3, SC4, AC5, PK6, OL7, SW8, BK9, CT1, AG2, PO3, AT4, AD5, FD6, CE7, HP8, PM9)",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "x",
                openapi.IN_QUERY,
                description="Longitude coordinate",
                type=openapi.TYPE_NUMBER,
                required=True,
            ),
            openapi.Parameter(
                "y",
                openapi.IN_QUERY,
                description="Latitude coordinate",
                type=openapi.TYPE_NUMBER,
                required=True,
            ),
            openapi.Parameter(
                "radius",
                openapi.IN_QUERY,
                description="Search radius in meters (default: 20000)",
                type=openapi.TYPE_INTEGER,
                default=20000,
                required=False,
            ),
            openapi.Parameter(
                "page",
                openapi.IN_QUERY,
                description="Page number (default: 1)",
                type=openapi.TYPE_INTEGER,
                default=1,
                required=False,
            ),
            openapi.Parameter(
                "size",
                openapi.IN_QUERY,
                description="Number of results per page (default: 15)",
                type=openapi.TYPE_INTEGER,
                default=15,
                required=False,
            ),
            openapi.Parameter(
                "sort",
                openapi.IN_QUERY,
                description="Sort order: 'accuracy' or 'distance'",
                type=openapi.TYPE_STRING,
                default="accuracy",
                enum=["accuracy", "distance"],
                required=False,
            ),
        ],
        responses={
            200: openapi.Response(
                description="Successful category search results",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "documents": openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    "id": openapi.Schema(type=openapi.TYPE_STRING),
                                    "place_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "category_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "category_group_code": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "category_group_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "phone": openapi.Schema(type=openapi.TYPE_STRING),
                                    "address_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "road_address_name": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "x": openapi.Schema(type=openapi.TYPE_STRING),
                                    "y": openapi.Schema(type=openapi.TYPE_STRING),
                                    "place_url": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                    "distance": openapi.Schema(
                                        type=openapi.TYPE_STRING
                                    ),
                                },
                            ),
                        ),
                        "meta": openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                "total_count": openapi.Schema(
                                    type=openapi.TYPE_INTEGER
                                ),
                                "pageable_count": openapi.Schema(
                                    type=openapi.TYPE_INTEGER
                                ),
                                "is_end": openapi.Schema(type=openapi.TYPE_BOOLEAN),
                            },
                        ),
                    },
                ),
            ),
            400: openapi.Response(
                description="Bad Request - Missing required parameters",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            500: openapi.Response(
                description="Internal Server Error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
        },
        tags=["Kakao Map API"],
    )
    def get(self, request):
        try:
            category_group_code = request.query_params.get("category_group_code")
            x = request.query_params.get("x")
            y = request.query_params.get("y")

            if not all([category_group_code, x, y]):
                return Response(
                    {"error": "category_group_code, x, and y parameters are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            x = float(x)
            y = float(y)
            radius = int(request.query_params.get("radius", 20000))
            page = int(request.query_params.get("page", 1))
            size = int(request.query_params.get("size", 15))
            sort = request.query_params.get("sort", "accuracy")

            kakao_service = KakaoMapService()
            results = kakao_service.search_by_category(
                category_group_code=category_group_code,
                x=x,
                y=y,
                radius=radius,
                page=page,
                size=size,
                sort=sort,
            )

            return Response(results, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.error(f"Invalid parameter values: {str(e)}")
            return Response(
                {"error": "Invalid parameter values"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Category search failed: {str(e)}")
            return Response(
                {"error": "Search failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class KakaoCategoriesView(APIView):
    """API view for getting available Kakao Map categories"""

    @swagger_auto_schema(
        operation_description="Get list of available Kakao Map category codes",
        responses={
            200: openapi.Response(
                description="List of available categories",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    additional_properties=openapi.Schema(type=openapi.TYPE_STRING),
                ),
            ),
            500: openapi.Response(
                description="Internal Server Error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"error": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
        },
        tags=["Kakao Map API"],
    )
    def get(self, request):
        try:
            categories = KakaoMapService.get_available_categories()
            return Response(categories, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Failed to get categories: {str(e)}")
            return Response(
                {"error": "Failed to get categories"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
