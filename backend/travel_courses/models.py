import uuid
from django.db import models
from django.conf import settings
# Route 모델 import 경로는 실제 프로젝트 구조에 맞게 수정 필요
from routes.models import Route

class TravelCourse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TravelCourseRoute(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    travel_course = models.ForeignKey(TravelCourse, on_delete=models.CASCADE, related_name='travel_course_routes')
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    sequence = models.PositiveIntegerField()

    class Meta:
        unique_together = ('travel_course', 'route')
        ordering = ['sequence'] 