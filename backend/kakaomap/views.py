from django.http import JsonResponse
from django.conf import settings
import requests
import math

# Create your views here.


def map_kakao_category_to_place_type(category_group_code):
    if category_group_code in ["FD6", "CE7"]:
        return "RESTAURANT"
    elif category_group_code in ["AT4", "CT1"]:
        return "ATTRACTION"
    elif category_group_code == "MT1":
        return "SHOPPING"
    else:
        return "ETC"


def get_kakao_map(request):
    lat = request.GET.get("lat")
    lng = request.GET.get("lng")
    if not lat or not lng:
        return JsonResponse({"error": "lat, lng required"}, status=400)
    url = f"https://dapi.kakao.com/v2/maps/staticmap?center={lng},{lat}&level=3&w=500&h=400"
    # headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"}
    # 실제로 이미지를 받아오지 않고, URL만 반환
    return JsonResponse({"map_url": url})


def search_places_from_kakao(request):
    query = request.GET.get("query")
    if not query:
        return JsonResponse({"error": "query required"}, status=400)
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"}
    params = {"query": query, "page": 1, "size": 15, "sort": "accuracy"}
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
        print("카카오 응답:", response.text)  # 실제 응답을 로그로 출력
        data = response.json()
    except requests.exceptions.RequestException as e:
        return JsonResponse(
            {"error": f"Failed to fetch data from Kakao API: {str(e)}"}, status=500
        )
    except ValueError:
        return JsonResponse(
            {"error": "Invalid JSON response from Kakao API"}, status=500
        )
    results = []
    for doc in data.get("documents", []):
        place_type = map_kakao_category_to_place_type(doc.get("category_group_code"))
        results.append(
            {
                "name": doc.get("place_name"),
                "address": doc.get("address_name"),
                "road_address": doc.get("road_address_name"),
                "lat": float(doc["y"]) if doc.get("y") else None,
                "lng": float(doc["x"]) if doc.get("x") else None,
                "external_id": doc.get("id"),
                "external_url": doc.get("place_url"),
                "place_type": place_type,
                "phone_number": doc.get("phone"),
            }
        )
    return JsonResponse({"results": results})


def calculate_distance_haversine(lat1, lng1, lat2, lng2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees) using Haversine formula
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])

    # Haversine formula
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in kilometers
    radius = 6371
    distance = c * radius

    return distance


def calculate_distance(request):
    """
    Calculate straight-line distance between two points
    """
    try:
        lat1 = float(request.GET.get("lat1"))
        lng1 = float(request.GET.get("lng1"))
        lat2 = float(request.GET.get("lat2"))
        lng2 = float(request.GET.get("lng2"))
    except (TypeError, ValueError):
        return JsonResponse(
            {"error": "lat1, lng1, lat2, lng2 required as numbers"}, status=400
        )

    distance_km = calculate_distance_haversine(lat1, lng1, lat2, lng2)

    return JsonResponse(
        {
            "distance_km": round(distance_km, 2),
            "distance_m": round(distance_km * 1000, 0),
        }
    )


def get_route_info_from_kakao(request):
    """
    Get route information (distance, duration) between two points using Kakao Map API
    """
    try:
        origin_lat = float(request.GET.get("origin_lat"))
        origin_lng = float(request.GET.get("origin_lng"))
        destination_lat = float(request.GET.get("destination_lat"))
        destination_lng = float(request.GET.get("destination_lng"))
        priority = request.GET.get("priority", "RECOMMEND")  # RECOMMEND, TIME, DISTANCE
    except (TypeError, ValueError):
        return JsonResponse(
            {
                "error": "origin_lat, origin_lng, destination_lat, destination_lng required as numbers"
            },
            status=400,
        )

    url = "https://apis-navi.kakaomobility.com/v1/directions"
    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"}
    params = {
        "origin": f"{origin_lng},{origin_lat}",
        "destination": f"{destination_lng},{destination_lat}",
        "priority": priority,
        "car_fuel": "GASOLINE",
        "car_hipass": "false",
        "alternatives": "false",
        "road_details": "false",
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        if data.get("routes"):
            route = data["routes"][0]
            summary = route.get("summary", {})

            return JsonResponse(
                {
                    "distance_m": summary.get("distance", 0),
                    "distance_km": round(summary.get("distance", 0) / 1000, 2),
                    "duration_sec": summary.get("duration", 0),
                    "duration_min": round(summary.get("duration", 0) / 60, 1),
                    "fare": summary.get("fare", 0),
                    "priority": priority,
                }
            )
        else:
            return JsonResponse({"error": "No route found"}, status=404)

    except requests.exceptions.RequestException as e:
        return JsonResponse(
            {"error": f"Failed to fetch route data from Kakao API: {str(e)}"},
            status=500,
        )
    except ValueError:
        return JsonResponse(
            {"error": "Invalid JSON response from Kakao API"}, status=500
        )


def calculate_multi_point_distance(request):
    """
    Calculate total distance for multiple points (route optimization)
    Input: JSON array of coordinates
    Output: Total distance and optimized order
    """
    import json

    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        points = data.get("points", [])

        if len(points) < 2:
            return JsonResponse({"error": "At least 2 points required"}, status=400)

        # Simple nearest neighbor algorithm for route optimization
        # Start from first point (user location)
        optimized_order = [0]
        current_point = 0
        unvisited = list(range(1, len(points)))
        total_distance = 0

        while unvisited:
            current_lat = points[current_point]["lat"]
            current_lng = points[current_point]["lng"]

            # Find nearest unvisited point
            min_distance = float("inf")
            nearest_point = None

            for point_idx in unvisited:
                point_lat = points[point_idx]["lat"]
                point_lng = points[point_idx]["lng"]
                distance = calculate_distance_haversine(
                    current_lat, current_lng, point_lat, point_lng
                )

                if distance < min_distance:
                    min_distance = distance
                    nearest_point = point_idx

            # Move to nearest point
            optimized_order.append(nearest_point)
            unvisited.remove(nearest_point)
            total_distance += min_distance
            current_point = nearest_point

        return JsonResponse(
            {
                "total_distance_km": round(total_distance, 2),
                "optimized_order": optimized_order,
                "points_count": len(points),
            }
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except KeyError:
        return JsonResponse(
            {"error": "Each point must have lat and lng fields"}, status=400
        )
