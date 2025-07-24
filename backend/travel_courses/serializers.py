from rest_framework import serializers
from .models import TravelCourse, TravelCourseRoute
from routes.models import Route

class TravelCourseRouteSerializer(serializers.ModelSerializer):
    route_id = serializers.UUIDField(source='route.id')
    class Meta:
        model = TravelCourseRoute
        fields = ['route_id', 'sequence']

class TravelCourseSerializer(serializers.ModelSerializer):
    routes = TravelCourseRouteSerializer(many=True, write_only=True)
    class Meta:
        model = TravelCourse
        fields = ['id', 'title', 'description', 'routes']

    def create(self, validated_data):
        routes_data = validated_data.pop('routes')
        travel_course = TravelCourse.objects.create(**validated_data)
        for route_data in routes_data:
            route = Route.objects.get(id=route_data['route']['id'])
            TravelCourseRoute.objects.create(
                travel_course=travel_course,
                route=route,
                sequence=route_data['sequence']
            )
        return travel_course 