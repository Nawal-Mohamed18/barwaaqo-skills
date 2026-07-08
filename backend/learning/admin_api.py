import secrets

from django.db.models import Count
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from courses.models import Course
from learning.models import Enrollment, LearningState, LessonWatchProgress, SiteVisit
from learning.services import clear_course_progress


def _require_admin(user):
    return user.lms_role == User.Role.ADMIN


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        role_filter = request.query_params.get("role")
        qs = User.objects.annotate(
            enrollment_count=Count("enrollments"),
            teaching_count=Count("teaching_courses"),
        ).order_by("-date_joined")

        if role_filter == "student":
            qs = qs.filter(role=User.Role.STUDENT)
        elif role_filter == "teacher":
            qs = qs.filter(role__in=[User.Role.TEACHER, User.Role.ADMIN])

        rows = []
        for user in qs[:200]:
            rows.append({
                "id": str(user.pk),
                "email": user.email,
                "name": user.display_name,
                "role": user.lms_role,
                "emailVerified": user.email_verified,
                "dateJoined": user.date_joined.isoformat() if user.date_joined else None,
                "enrollments": user.enrollment_count,
                "coursesTeaching": user.teaching_count,
            })
        return Response(rows)


class AdminUserManageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        data = request.data
        update_fields = []

        if "role" in data:
            role = data["role"]
            if role not in {User.Role.STUDENT, User.Role.TEACHER, User.Role.ADMIN}:
                return Response({"detail": "Invalid role."}, status=400)
            if str(request.user.pk) == str(user.pk) and role != User.Role.ADMIN:
                return Response({"detail": "You cannot remove your own admin access."}, status=400)
            user.role = role
            update_fields.append("role")

        if "emailVerified" in data:
            user.email_verified = bool(data["emailVerified"])
            update_fields.append("email_verified")

        if not update_fields:
            return Response({"detail": "No valid fields to update."}, status=400)

        user.save(update_fields=update_fields)
        return Response({
            "id": str(user.pk),
            "role": user.lms_role,
            "emailVerified": user.email_verified,
        })


class AdminEnrollmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        rows = []
        for enrollment in (
            Enrollment.objects.select_related("user", "course")
            .order_by("-enrolled_at")[:200]
        ):
            rows.append({
                "id": enrollment.pk,
                "email": enrollment.user.email,
                "userId": str(enrollment.user.pk),
                "courseId": enrollment.course.slug,
                "courseTitle": enrollment.course.title,
                "enrolledAt": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                "completed": bool(enrollment.completed_at),
            })
        return Response(rows)


class AdminEnrollmentManageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id, course_slug):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        try:
            user = User.objects.get(pk=user_id)
            course = Course.objects.get(slug=course_slug)
        except (User.DoesNotExist, Course.DoesNotExist):
            return Response({"detail": "Enrollment not found."}, status=404)

        if not clear_course_progress(user, course):
            return Response({"detail": "User is not enrolled in this course."}, status=404)

        return Response({"ok": True})


class AdminTeacherListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        rows = []
        teachers = User.objects.filter(
            role__in=[User.Role.TEACHER, User.Role.ADMIN]
        ).annotate(course_count=Count("teaching_courses")).order_by("first_name")

        for teacher in teachers:
            courses = list(
                teacher.teaching_courses.values_list("title", flat=True)[:6]
            )
            rows.append({
                "id": str(teacher.pk),
                "name": teacher.display_name,
                "email": teacher.email,
                "role": teacher.lms_role,
                "courseCount": teacher.course_count,
                "courses": courses,
            })
        return Response(rows)

    def post(self, request):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        data = request.data
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not name or not email:
            return Response({"detail": "Name and email are required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"detail": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        temp_password = None
        if not password or len(password) < 8:
            temp_password = secrets.token_urlsafe(10)
            password = temp_password

        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=name,
            password=password,
            role=User.Role.TEACHER,
            email_verified=True,
        )

        payload = {
            "id": str(user.pk),
            "name": user.display_name,
            "email": user.email,
            "role": user.lms_role,
            "coursesTeaching": 0,
            "enrollments": 0,
        }
        if temp_password:
            payload["temporaryPassword"] = temp_password
        return Response(payload, status=status.HTTP_201_CREATED)


class AdminSystemActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({"detail": "Forbidden."}, status=403)

        from django.db.models import Count, Max
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        users_qs = User.objects.annotate(
            enrollment_count=Count("enrollments"),
            visit_count=Count("site_visits"),
            last_visit=Max("site_visits__visited_at"),
        ).order_by("-date_joined")[:200]

        users = []
        for user in users_qs:
            learning = LearningState.objects.filter(user=user).select_related("last_course").first()
            users.append({
                "id": str(user.pk),
                "email": user.email,
                "name": user.display_name,
                "role": user.lms_role,
                "emailVerified": user.email_verified,
                "dateJoined": user.date_joined.isoformat() if user.date_joined else None,
                "enrollments": user.enrollment_count,
                "visits": user.visit_count,
                "lastVisit": user.last_visit.isoformat() if user.last_visit else None,
                "lastCourse": learning.last_course.title if learning and learning.last_course else None,
                "lastLesson": learning.last_lesson_number if learning else None,
            })

        visits = []
        for visit in SiteVisit.objects.select_related("user").order_by("-visited_at")[:150]:
            visits.append({
                "id": visit.pk,
                "email": visit.user.email if visit.user_id else None,
                "name": visit.user.display_name if visit.user_id else "Guest",
                "pagePath": visit.page_path,
                "pageTitle": visit.page_title,
                "sessionKey": visit.session_key,
                "visitedAt": visit.visited_at.isoformat(),
            })

        watching = []
        watch_qs = (
            LessonWatchProgress.objects.select_related("user", "course")
            .filter(watch_seconds__gt=0)
            .order_by("-updated_at")[:150]
        )
        lesson_titles = {}
        for row in watch_qs:
            cache_key = (row.course_id, row.lesson_number)
            if cache_key not in lesson_titles:
                lesson = row.course.lessons.filter(lesson_number=row.lesson_number).first()
                lesson_titles[cache_key] = lesson.title if lesson else f"Lesson {row.lesson_number}"
            watching.append({
                "email": row.user.email,
                "name": row.user.display_name,
                "courseId": row.course.slug,
                "courseTitle": row.course.title,
                "lessonNumber": row.lesson_number,
                "lessonTitle": lesson_titles[cache_key],
                "watchSeconds": row.watch_seconds,
                "updatedAt": row.updated_at.isoformat(),
            })

        active_states = (
            LearningState.objects.select_related("user", "last_course")
            .filter(last_course__isnull=False)
            .order_by("-updated_at")[:50]
        )
        currently_watching = []
        for state in active_states:
            if not state.last_course:
                continue
            lesson = state.last_course.lessons.filter(lesson_number=state.last_lesson_number).first()
            currently_watching.append({
                "email": state.user.email,
                "name": state.user.display_name,
                "courseId": state.last_course.slug,
                "courseTitle": state.last_course.title,
                "lessonNumber": state.last_lesson_number,
                "lessonTitle": lesson.title if lesson else f"Lesson {state.last_lesson_number}",
                "updatedAt": state.updated_at.isoformat(),
            })

        total_visits = SiteVisit.objects.count()
        today_visits = SiteVisit.objects.filter(visited_at__date=today).count()
        week_visits = SiteVisit.objects.filter(
            visited_at__gte=timezone.now() - timedelta(days=7)
        ).count()

        return Response({
            "stats": {
                "totalUsers": User.objects.count(),
                "verifiedUsers": User.objects.filter(email_verified=True).count(),
                "totalVisits": total_visits,
                "todayVisits": today_visits,
                "weekVisits": week_visits,
                "activeLearners": LearningState.objects.filter(last_course__isnull=False).count(),
            },
            "users": users,
            "visits": visits,
            "watching": watching,
            "currentlyWatching": currently_watching,
        })
