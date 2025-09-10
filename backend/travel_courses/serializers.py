from rest_framework import serializers
from .models import TravelCourse, TravelCourseRoute
from routes.models import Route


class TravelCourseRouteSerializer(serializers.ModelSerializer):
    route_id = serializers.UUIDField(source="route.id")

    class Meta:
        model = TravelCourseRoute
        fields = ["route_id", "sequence"]


class TravelCourseSerializer(serializers.ModelSerializer):
    routes = TravelCourseRouteSerializer(many=True, write_only=True)

    class Meta:
        model = TravelCourse
        fields = [
            "id",
            "title",
            "description",
            "routes",
            "start_date",
            "end_date",
            "destination",
        ]

    def create(self, validated_data):
        routes_data = validated_data.pop("routes")
        travel_course = TravelCourse.objects.create(**validated_data)
        for route_data in routes_data:
            route = Route.objects.get(id=route_data["route"]["id"])
            TravelCourseRoute.objects.create(
                travel_course=travel_course,
                route=route,
                sequence=route_data["sequence"],
            )
        return travel_course

    def update(self, instance, validated_data):
        routes_data = validated_data.pop("routes", None)

        # Update the main TravelCourse fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle routes update if provided
        if routes_data is not None:
            # Clear existing routes
            instance.travelcourseroute_set.all().delete()

            # Create new routes
            for route_data in routes_data:
                route = Route.objects.get(id=route_data["route"]["id"])
                TravelCourseRoute.objects.create(
                    travel_course=instance,
                    route=route,
                    sequence=route_data["sequence"],
                )

        return instance
