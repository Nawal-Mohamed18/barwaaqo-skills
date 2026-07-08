from django.contrib import admin

from .models import Course, Lesson, RoadmapPhase


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


class RoadmapInline(admin.TabularInline):
    model = RoadmapPhase
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "category", "featured")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [LessonInline, RoadmapInline]
