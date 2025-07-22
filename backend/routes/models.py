import uuid
from django.db import models
from django.conf import settings
from core.models import BaseModel


class Route(BaseModel):
    """
    A model representing a user-created route (travel path).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="routes",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    places = models.ManyToManyField(
        "places.Place", through="RoutePlace", related_name="routes"
    )

    def __str__(self) -> str:
        return self.title


class RoutePlace(BaseModel):
    """
    A model representing the relationship between Route and Place, with order and memo.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(
        Route, on_delete=models.CASCADE, related_name="route_places"
    )
    place = models.ForeignKey(
        "places.Place", on_delete=models.CASCADE, related_name="route_places"
    )
    sequence = models.PositiveIntegerField()  # Order in the route
    memo = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["route", "place"], name="unique_route_place"
            ),
            models.UniqueConstraint(
                fields=["route", "sequence"], name="unique_route_sequence"
            ),
        ]
        ordering = ["sequence"]

    def __str__(self) -> str:
        return f"{self.route.title} - {self.place.name} ({self.sequence})"
