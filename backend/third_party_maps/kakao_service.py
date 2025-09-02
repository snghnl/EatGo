import requests
from typing import Dict, Optional
from django.conf import settings
from logging import getLogger


logger = getLogger(__name__)


class KakaoMapService:
    """Service for interacting with Kakao Map API for POI search"""

    BASE_URL = "https://dapi.kakao.com/v2/local/search"

    # Kakao Map category codes
    CATEGORY_CODES = {
        "MT1": "대형마트",
        "CS2": "편의점",
        "PS3": "어린이집,유치원",
        "SC4": "학교",
        "AC5": "학원",
        "PK6": "주차장",
        "OL7": "주유소,충전소",
        "SW8": "지하철역",
        "BK9": "은행",
        "CT1": "문화시설",
        "AG2": "중개업소",
        "PO3": "공공기관",
        "AT4": "관광명소",
        "AD5": "숙박",
        "FD6": "음식점",
        "CE7": "카페",
        "HP8": "병원",
        "PM9": "약국",
    }

    def __init__(self):
        self.api_key = settings.KAKAO_REST_API_KEY
        if not self.api_key:
            logger.error("KAKAO_REST_API_KEY not found in settings")
            raise ValueError(
                "KAKAO_REST_API_KEY not found in settings. Please set it in your environment variables."
            )
        logger.info("KakaoMapService initialized successfully")

    def _make_request(self, endpoint: str, params: Dict) -> Dict:
        """Make authenticated request to Kakao API"""
        headers = {
            "Authorization": f"KakaoAK {self.api_key}",
            "Content-Type": "application/json",
        }

        logger.debug(
            f"Making request to {self.BASE_URL}/{endpoint} with params: {params}"
        )

        try:
            response = requests.get(
                f"{self.BASE_URL}/{endpoint}", headers=headers, params=params
            )
            response.raise_for_status()
            logger.info(
                f"Successful API request to {endpoint}, status: {response.status_code}"
            )
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Kakao API request failed for {endpoint}: {str(e)}")
            raise Exception(f"Kakao API request failed: {str(e)}")
        except ValueError as e:
            logger.error(
                f"Invalid JSON response from Kakao API for {endpoint}: {str(e)}"
            )
            raise Exception(f"Invalid JSON response from Kakao API: {str(e)}")

    def search_by_keyword(
        self,
        query: str,
        x: Optional[float] = None,
        y: Optional[float] = None,
        radius: int = 15000,
        page: int = 1,
        size: int = 15,
        sort: str = "accuracy",
    ) -> Dict:
        """
        Search POI by keyword

        Args:
            query: Search keyword
            x: Longitude (optional, for location-based search)
            y: Latitude (optional, for location-based search)
            radius: Search radius in meters (default: 20km)
            page: Page number (1-45)
            size: Number of results per page (1-15)
            sort: Sort order ('accuracy' or 'distance')

        Returns:
            Dict containing search results
        """
        logger.info(f"Searching for POI by keyword: {query}")
        params = {"query": query, "page": page, "size": size, "sort": sort}

        if x is not None and y is not None:
            params.update({"x": x, "y": y, "radius": radius})

        return self._make_request("keyword.json", params)

    def search_by_category(
        self,
        category_group_code: str,
        x: float,
        y: float,
        radius: int = 20000,
        page: int = 1,
        size: int = 15,
        sort: str = "accuracy",
    ) -> Dict:
        """
        Search POI by category

        Args:
            category_group_code: Category code (MT1, CS2, PS3, SC4, AC5, PK6, OL7, SW8, BK9, CT1, AG2, PO3, AT4, AD5, FD6, CE7, HP8, PM9)
            x: Longitude
            y: Latitude
            radius: Search radius in meters
            page: Page number
            size: Number of results per page
            sort: Sort order

        Returns:
            Dict containing search results
        """
        logger.info(
            f"Searching for POI by category: {category_group_code} at location ({x}, {y})"
        )
        params = {
            "category_group_code": category_group_code,
            "x": x,
            "y": y,
            "radius": radius,
            "page": page,
            "size": size,
            "sort": sort,
        }

        return self._make_request("category.json", params)

    def get_place_by_id(self, place_id: str) -> Optional[Dict]:
        """
        Get detailed place information by Kakao place ID
        Note: This is a simplified implementation. Kakao doesn't have a direct place details API like Google.
        You might need to use the keyword search with the place name to get details.
        """
        pass

    @classmethod
    def get_category_name(cls, category_code: str) -> str:
        """Get Korean name for category code"""
        return cls.CATEGORY_CODES.get(category_code, category_code)

    @classmethod
    def get_available_categories(cls) -> Dict[str, str]:
        """Get all available category codes and their Korean names"""
        return cls.CATEGORY_CODES.copy()
