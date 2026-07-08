from django.db.models import Avg, Count
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from learning.models import Certificate, Enrollment

from .models import Course
from .serializers import serialize_course


class CourseListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        courses = Course.objects.prefetch_related("lessons", "roadmap_phases").all()
        return Response([serialize_course(c) for c in courses])


class CourseDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            course = Course.objects.prefetch_related("lessons", "roadmap_phases").get(slug=slug)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found."}, status=404)
        return Response(serialize_course(course))


class PlatformStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        courses = Course.objects.all()
        free_count = courses.filter(free=True).count()
        premium_count = courses.filter(free=False).count()
        verified_learners = User.objects.filter(email_verified=True).count()
        enrollments = Enrollment.objects.count()
        certificates = Certificate.objects.count()
        avg_rating = courses.aggregate(avg=Avg("rating"))["avg"] or 0
        instructors = courses.values("instructor").distinct().count()

        return Response({
            "students": verified_learners,
            "courses": courses.count(),
            "freeCourses": free_count,
            "premiumCourses": premium_count,
            "enrollments": enrollments,
            "certificatesIssued": certificates,
            "averageRating": round(float(avg_rating), 1),
            "instructors": instructors,
        })
