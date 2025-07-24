from rest_framework import viewsets, permissions
from .models import Route
from .serializers import RouteSerializer


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)
