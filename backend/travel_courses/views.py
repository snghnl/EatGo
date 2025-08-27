from rest_framework import viewsets, generics
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


class MyTravelCourseListAPIView(generics.ListAPIView):
    serializer_class = TravelCourseSerializer
    permission_classes = [IsAuthenticated]  # 인증된 사용자만 접근 가능

    def get_queryset(self):
        user = self.request.user
        return TravelCourse.objects.filter(created_by=user)
