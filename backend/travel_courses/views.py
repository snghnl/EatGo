from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TravelCourse
from .serializers import TravelCourseSerializer
from rest_framework.permissions import IsAuthenticated


# Removed legacy TravelCourseView and in-memory storage (TRAVEL_COURSES)
class TravelCourseViewSet(viewsets.ModelViewSet):
    queryset = TravelCourse.objects.all()
    serializer_class = TravelCourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"])
    def share_data(self, request, pk=None):
        """
        카카오 공유용 메타데이터 제공
        """
        travel_course = self.get_object()

        # 여행 코스에 포함된 경로들 정보
        routes = travel_course.routes.all()
        routes_names = [route.title for route in routes]

        # 설명 텍스트 생성
        description = travel_course.description
        if len(description) > 100:
            description = description[:100] + "..."

        # 경로 정보 추가
        if routes_names:
            routes_text = " → ".join(routes_names[:3])  # 최대 3개만
            if len(routes_names) > 3:
                routes_text += f" 외 {len(routes_names) - 3}곳"
            description = f"{routes_text}\n{description}"

        return Response(
            {
                "title": travel_course.title,
                "description": description,
                "share_url": f"https://eatgo.com/courses/{travel_course.id}",
                "image_url": "https://eatgo.com/static/images/default-course.jpg",
            }
        )

    @action(detail=True, methods=["post"])
    def increment_share_count(self, request, pk=None):
        """
        공유 횟수 증가 (통계용)
        """
        travel_course = self.get_object()

        # share_count 필드가 없으므로 나중에 추가하거나 별도 모델로 관리
        # 지금은 간단히 응답만 반환
        return Response(
            {
                "message": "공유 완료",
                "travel_course_id": str(travel_course.id),
                "title": travel_course.title,
            }
        )
