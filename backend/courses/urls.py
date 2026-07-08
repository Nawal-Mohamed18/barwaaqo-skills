from django.urls import path

from .views import CourseDetailView, CourseListView, PlatformStatsView

urlpatterns = [
    path("", CourseListView.as_view(), name="course-list"),
    path("stats/", PlatformStatsView.as_view(), name="platform-stats"),
    path("<slug:slug>/", CourseDetailView.as_view(), name="course-detail"),
]
