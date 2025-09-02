from django.db import models
from django.contrib.postgres.fields import ArrayField


class POIData(models.Model):
    """Model to store Points of Interest data from third-party APIs"""

    PROVIDER_CHOICES = [
        ("kakao", "Kakao Map"),
        ("google", "Google Maps"),
    ]

    external_id = models.CharField(max_length=255, help_text="External API place ID")
    provider = models.CharField(max_length=10, choices=PROVIDER_CHOICES)
    name = models.CharField(max_length=255)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    rating = models.FloatField(blank=True, null=True)
    price_level = models.IntegerField(blank=True, null=True)
    types = ArrayField(models.CharField(max_length=100), blank=True, default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["external_id", "provider"]
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
            models.Index(fields=["provider", "external_id"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.provider})"


class POIPhoto(models.Model):
    """Model to store photos associated with POI"""

    poi = models.ForeignKey(POIData, on_delete=models.CASCADE, related_name="photos")
    photo_reference = models.CharField(
        max_length=255, help_text="External photo reference"
    )
    photo_url = models.URLField(blank=True, null=True, help_text="Cached photo URL")
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.poi.name}"


class POIOpeningHours(models.Model):
    """Model to store opening hours for POI"""

    DAYS_OF_WEEK = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    poi = models.ForeignKey(
        POIData, on_delete=models.CASCADE, related_name="opening_hours"
    )
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    open_time = models.TimeField(blank=True, null=True)
    close_time = models.TimeField(blank=True, null=True)
    is_closed = models.BooleanField(default=False)

    class Meta:
        unique_together = ["poi", "day_of_week"]

    def __str__(self):
        day_name = dict(self.DAYS_OF_WEEK)[self.day_of_week]
        if self.is_closed:
            return f"{self.poi.name} - {day_name}: Closed"
        return f"{self.poi.name} - {day_name}: {self.open_time}-{self.close_time}"


class POIReview(models.Model):
    """Model to store reviews for POI"""

    poi = models.ForeignKey(POIData, on_delete=models.CASCADE, related_name="reviews")
    author_name = models.CharField(max_length=255)
    rating = models.FloatField()
    text = models.TextField()
    review_time = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-review_time"]

    def __str__(self):
        return f"Review for {self.poi.name} by {self.author_name}"
