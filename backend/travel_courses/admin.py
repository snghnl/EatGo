# Register your models here.
from django.contrib import admin
from .models import TravelCourse, TravelCourseRoute

admin.site.register(TravelCourse)
admin.site.register(TravelCourseRoute)
