from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
import uuid
from .utils import load_mock_routes
from rest_framework import viewsets
from .models import TravelCourse
from .serializers import TravelCourseSerializer
from rest_framework.permissions import AllowAny

# 임시 메모리 저장소
TRAVEL_COURSES = []

@method_decorator(csrf_exempt, name='dispatch')
class TravelCourseView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            title = data.get('title')
            description = data.get('description')
            routes = data.get('routes', [])
            if not title or not routes:
                return JsonResponse({'error': 'title and routes are required'}, status=400)
            # mock routes 불러오기
            mock_routes = load_mock_routes()
            # route_id 유효성 검사
            for r in routes:
                if not any(route['id'] == r['route_id'] for route in mock_routes):
                    return JsonResponse({'error': f"Route {r['route_id']} not found"}, status=400)
            # TravelCourse 생성
            course_id = str(uuid.uuid4())
            travel_course = {
                'id': course_id,
                'title': title,
                'description': description,
                'routes': routes
            }
            TRAVEL_COURSES.append(travel_course)
            return JsonResponse({'id': course_id}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    def get(self, request, course_id=None):
        if course_id:
            course = next((c for c in TRAVEL_COURSES if c['id'] == course_id), None)
            if not course:
                return JsonResponse({'error': 'TravelCourse not found'}, status=404)
            # mock routes 불러오기
            mock_routes = load_mock_routes()
            course_routes = []
            for r in course['routes']:
                route_info = next((route for route in mock_routes if route['id'] == r['route_id']), None)
                if route_info:
                    course_routes.append({**route_info, 'sequence': r['sequence']})
            result = {
                'id': course['id'],
                'title': course['title'],
                'description': course['description'],
                'routes': course_routes
            }
            return JsonResponse(result)
        else:
            # 전체 목록 반환
            return JsonResponse({'travel_courses': TRAVEL_COURSES}) 

class TravelCourseViewSet(viewsets.ModelViewSet):
    queryset = TravelCourse.objects.all()
    serializer_class = TravelCourseSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user) 