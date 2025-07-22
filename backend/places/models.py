import uuid
from django.db import models
from core.models import BaseModel
from django.conf import settings


class Place(BaseModel):
    """
    A model representing a place (POI) in the database, based on SRS.md specification.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='places', on_delete=models.SET_NULL, null=True, blank=True) 
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


class PlaceCategory(BaseModel):
    """
    A model representing the relationship between Place and Category, with a primary flag.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    place = models.ForeignKey('Place', on_delete=models.CASCADE, related_name='place_categories')
    category = models.ForeignKey('core.Category', on_delete=models.CASCADE, related_name='place_categories')
    is_primary = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"{self.place.name} - {self.category.name} ({'Primary' if self.is_primary else 'Secondary'})"


class PlaceHour(BaseModel):
    """
    A model representing opening hours for a place.
    """
    class DayOfWeek(models.TextChoices):
        MONDAY = 'MON', 'Monday'
        TUESDAY = 'TUE', 'Tuesday'
        WEDNESDAY = 'WED', 'Wednesday'
        THURSDAY = 'THU', 'Thursday'
        FRIDAY = 'FRI', 'Friday'
        SATURDAY = 'SAT', 'Saturday'
        SUNDAY = 'SUN', 'Sunday'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    place = models.ForeignKey('Place', on_delete=models.CASCADE, related_name='hours')
    day_of_week = models.CharField(
        max_length=3,
        choices=DayOfWeek.choices,
    )
    open_time = models.TimeField()
    close_time = models.TimeField()

    def __str__(self) -> str:
        return f"{self.place.name} - {self.get_day_of_week_display()}: {self.open_time}~{self.close_time}"


class MenuItem(BaseModel):
    """
    A model representing a menu item for a place.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    place = models.ForeignKey('Place', on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    price = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.place.name} - {self.name}"
      