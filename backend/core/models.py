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