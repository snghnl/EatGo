"""
Route-related data selectors for reading operations.
"""

from typing import Dict, List, Optional, Any
from django.contrib.auth import get_user_model

from core.models import Category
from .service import RouteRecommendationService

User = get_user_model()


def user_preferences_get(
    *, user: Any, custom_preferences: Optional[List[Dict]] = None
) -> Dict[str, float]:
    """
    Get user preferences either from database or custom input.

    Args:
        user: User instance
        custom_preferences: Optional list of custom preference dictionaries
                          with keys 'category_id' and 'preference_score'

    Returns:
        Dictionary mapping category names to preference scores (0.0-1.0)
    """
    if custom_preferences:
        preferences = {}
        for pref in custom_preferences:
            try:
                category = Category.objects.get(id=pref["category_id"])
                preferences[category.name] = pref["preference_score"]
            except Category.DoesNotExist:
                continue
        return preferences

    # Use RouteRecommendationService to get stored preferences
    service = RouteRecommendationService(0, 0)  # Dummy coordinates for preferences only
    return service.get_user_preferences(user)
