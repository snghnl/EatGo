import uuid
from django.db import models
from core.models import BaseModel


class Province(BaseModel):
    """
    A model representing a Korean province (시/도) in the database.

    Attributes:
        id (UUIDField): Primary key for the province.
        name (CharField): The name of the province in Korean.
        name_en (CharField): The English name of the province (optional).
        is_active (BooleanField): Whether the province is active.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    name_en = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Province"
        verbose_name_plural = "Provinces"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class District(BaseModel):
    """
    A model representing a Korean district (시/군/구) in the database.

    Attributes:
        id (UUIDField): Primary key for the district.
        province (ForeignKey): The province this district belongs to.
        name (CharField): The name of the district in Korean.
        name_en (CharField): The English name of the district (optional).
        longitude (DecimalField): The longitude coordinate of the district center.
        latitude (DecimalField): The latitude coordinate of the district center.
        is_active (BooleanField): Whether the district is active.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    province = models.ForeignKey(
        Province, on_delete=models.CASCADE, related_name="districts"
    )
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6)
    latitude = models.DecimalField(max_digits=10, decimal_places=6)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "District"
        verbose_name_plural = "Districts"
        ordering = ["province__name", "name"]
        unique_together = [("province", "name")]
        constraints = [
            models.CheckConstraint(
                check=models.Q(longitude__gte=-180) & models.Q(longitude__lte=180),
                name="valid_longitude_range",
            ),
            models.CheckConstraint(
                check=models.Q(latitude__gte=-90) & models.Q(latitude__lte=90),
                name="valid_latitude_range",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.province.name} {self.name}"
