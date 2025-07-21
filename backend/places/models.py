import uuid
from django.db import models
from core.models import BaseModel
from django.conf import settings


class Place(BaseModel):
    """
    A model representing a place (POI) in the database, based on SRS.md specification.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='places', on_delete=models.SET_NULL, null=True) 
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    lng = models.FloatField()
    phone_number = models.CharField(max_length=255, blank=True)
    avg_rating = models.FloatField(blank=True, null=True)

    class PlaceType(models.TextChoices):
        RESTAURANT = 'RESTAURANT', 'Restaurant'
        ATTRACTION = 'ATTRACTION', 'Attraction'
        SHOPPING = 'SHOPPING', 'Shopping'
        ETC = 'ETC', 'Etc'

    place_type = models.CharField(
        max_length=20,
        choices=PlaceType.choices,
        default=PlaceType.RESTAURANT,
    )
    address = models.CharField(max_length=255, blank=True)
    road_address = models.CharField(max_length=255, blank=True)
    external_id = models.CharField(max_length=255, unique=True)  # External API ID
    external_url = models.URLField(blank=True)

    def __str__(self) -> str:
        return self.name


