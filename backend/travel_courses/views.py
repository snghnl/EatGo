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
from rest_framework.permissions import IsAuthenticated

# Removed legacy TravelCourseView and in-memory storage (TRAVEL_COURSES)
class TravelCourseViewSet(viewsets.ModelViewSet):
    queryset = TravelCourse.objects.all()
    serializer_class = TravelCourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

