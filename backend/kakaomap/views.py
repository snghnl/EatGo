from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import requests

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
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    if not lat or not lng:
        return JsonResponse({'error': 'lat, lng required'}, status=400)
    url = f"https://dapi.kakao.com/v2/maps/staticmap?center={lng},{lat}&level=3&w=500&h=400"
    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"}
    # 실제로 이미지를 받아오지 않고, URL만 반환
    return JsonResponse({'map_url': url})


def search_places_from_kakao(request):
    query = request.GET.get('query')
    if not query:
        return JsonResponse({'error': 'query required'}, status=400)
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"}
    params = {
        "query": query,
        "page": 1,
        "size": 15,
        "sort": "accuracy"
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
        print("카카오 응답:", response.text)  # 실제 응답을 로그로 출력
        data = response.json()
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': f'Failed to fetch data from Kakao API: {str(e)}'}, status=500)
    except ValueError:
        return JsonResponse({'error': 'Invalid JSON response from Kakao API'}, status=500)
    results = []
    for doc in data.get("documents", []):
        place_type = map_kakao_category_to_place_type(
            doc.get("category_group_code")
        )
        results.append({
            "name": doc.get("place_name"),
            "address": doc.get("address_name"),
            "road_address": doc.get("road_address_name"),
            "lat": float(doc["y"]) if doc.get("y") else None,
            "lng": float(doc["x"]) if doc.get("x") else None,
            "external_id": doc.get("id"),
            "external_url": doc.get("place_url"),
            "place_type": place_type,
            "phone_number": doc.get("phone"),
        })
    return JsonResponse({"results": results})
