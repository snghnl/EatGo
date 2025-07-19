from django.db import models
from core.models import BaseModel
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser, BaseModel):
    # Override username to match SRS specification (name field)
    username = models.CharField(max_length=50, unique=True, verbose_name="Name")
    
    # Email field (already exists in AbstractUser but ensuring it's unique)
    email = models.EmailField(unique=True, verbose_name="Email")
    
    # Login method to track authentication method (Kakao, email, etc.)
    login_method = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Email'),
            ('kakao', 'Kakao'),
            ('google', 'Google'),
        ],
        default='email',
        verbose_name="Login Method"
    )
    
    # Profile image URL
    profile_image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Profile Image URL"
    )
    
    # Override first_name and last_name to be optional since we're using username as name
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = "users"
    
    def __str__(self):
        return self.username



