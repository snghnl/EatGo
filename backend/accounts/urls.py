from django.urls import path
from .views import MeView, SignupView, DeleteAccountView


urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("me/delete/", DeleteAccountView.as_view(), name="delete_account"),
    path("signup/", SignupView.as_view(), name="signup"),
]
