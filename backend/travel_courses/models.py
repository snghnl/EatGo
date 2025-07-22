import uuid
from django.db import models
from django.conf import settings
from core.models import BaseModel
from routes.models import Route


class TravelCourse(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="travel_courses",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    routes = models.ManyToManyField(
        Route, through="TravelCourseRoute", related_name="travel_courses"
    )

    def __str__(self) -> str:
        return self.title


class TravelCourseRoute(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    travel_course = models.ForeignKey(
        TravelCourse, related_name="travel_course_routes", on_delete=models.CASCADE
    )
    route = models.ForeignKey(
        Route, related_name="travel_course_routes", on_delete=models.CASCADE
    )
    sequence = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["travel_course", "route"], name="unique_travel_course_route"
            )
        ]
        ordering = ["sequence"]

    def __str__(self) -> str:
        return f"{self.travel_course.title} - {self.route.title} ({self.sequence})"
