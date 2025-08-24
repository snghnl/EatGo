import uuid
from django.db import models
from core.models import BaseModel
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser, BaseModel):
    # Override username to match SRS specification (name field)
    username = models.CharField(max_length=50, unique=True, verbose_name="Name")

    # Email field (optional for social login, but can be required at application level)
    email = models.EmailField(blank=True, null=True, verbose_name="Email")

    # Login method to track authentication method (Kakao, email, etc.)
    login_method = models.CharField(
        max_length=20,
        choices=[
            ("email", "Email"),
            ("kakao", "Kakao"),
            ("google", "Google"),
        ],
        default="email",
        verbose_name="Login Method",
    )

    # Profile image URL
    profile_image_url = models.URLField(
        max_length=500, blank=True, null=True, verbose_name="Profile Image URL"
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


class UserPreference(BaseModel):
    """
    A model representing user preferences for different categories.
    Stores preference scores (0.0 to 1.0) for each category.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        related_name="user_preferences",
        on_delete=models.CASCADE,
        verbose_name="User",
    )
    category = models.ForeignKey(
        "core.Category",
        related_name="user_preferences",
        on_delete=models.CASCADE,
        verbose_name="Category",
    )
    preference_score = models.FloatField(
        verbose_name="Preference Score",
        help_text="Score between 0.0 and 1.0 indicating user's preference level",
    )

    class Meta:
        verbose_name = "User Preference"
        verbose_name_plural = "User Preferences"
        db_table = "user_preferences"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "category"], name="unique_user_category_preference"
            ),
            models.CheckConstraint(
                check=models.Q(preference_score__gte=0.0)
                & models.Q(preference_score__lte=1.0),
                name="valid_preference_score_range",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user.username} - {self.category.name}: {self.preference_score:.2f}"
        )
