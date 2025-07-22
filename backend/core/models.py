import uuid
from django.db import models

# Create your models here.
class BaseModel(models.Model):
    """
    An abstract base class that provides timestamp fields for tracking
    the creation and last modification times of model instances.

    Attributes:
        created_at (DateTimeField): The date and time when the instance was created.
        updated_at (DateTimeField): The date and time when the instance was last updated.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True



class Category(BaseModel):
    """
    A model representing a category of user preferences in the database.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=255, blank=True)
    color = models.CharField(max_length=255, blank=True)
    category_type = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name



