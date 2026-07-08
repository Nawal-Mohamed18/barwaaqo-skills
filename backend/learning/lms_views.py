from django.conf import settings
from django.db import models
from django.db.models import Count
from django.db import transaction
from django.utils.text import slugify
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from courses.models import Course
from courses.serializers import parse_duration
from learning.course_setup import (
    create_course_lessons,
    create_default_roadmap,
    instructor_avatar_url,
    setup_course_quiz,
)
from learning.models import Certificate, Enrollment, LearningState, LessonCompletion, QuizAttempt

from .views import _build_state, _course_progress


def _student_workspace(user):
    state = _build_state(user)
    learning_state = LearningState.objects.filter(user=user).select_related("last_course").first()

    enrolled_courses = []
    for slug in state["enrolled"]:
        try:
            course = Course.objects.prefetch_related("lessons").get(slug=slug)
        except Course.DoesNotExist:
            continue
        prog = state["progress"].get(slug, {})
        enrollment = Enrollment.objects.filter(user=user, course=course).first()
        quiz_passed = QuizAttempt.objects.filter(
            user=user, quiz__course=course, passed=True
        ).exists()
        enrolled_courses.append({
            "id": course.slug,
            "title": course.title,
            "category": course.category,
            "free": course.free,
            "percent": prog.get("percent", 0),
            "completedLessons": prog.get("completedLessons", []),
            "totalLessons": prog.get("totalLessons", course.lessons.count()),
            "isCompleted": bool(enrollment and enrollment.completed_at),
            "quizPassed": quiz_passed,
            "resumeLesson": learning_state.last_lesson_number
            if learning_state and learning_state.last_course_id == course.id
            else 1,
        })

    return {
        "role": "student",
        "stats": state["stats"],
        "last": state["last"],
        "enrolledCourses": enrolled_courses,
        "certificates": state["certificates"],
        "purchased": state["purchased"],
    }


def _teacher_workspace(user):
    courses = Course.objects.filter(teacher=user).prefetch_related("lessons")
    rows = []
    total_students = 0
    total_completions = 0

    for course in courses:
        enrollments = Enrollment.objects.filter(course=course)
        student_count = enrollments.count()
        completed = enrollments.filter(completed_at__isnull=False).count()
        total_students += student_count
        total_completions += completed

        progress_values = []
        for enrollment in enrollments.select_related("user")[:50]:
            progress_values.append(_course_progress(enrollment.user, course)["percent"])
        avg_progress = round(sum(progress_values) / len(progress_values)) if progress_values else 0

        rows.append({
            "id": course.slug,
            "title": course.title,
            "category": course.category,
            "lessonCount": course.lessons.count(),
            "students": student_count,
            "completions": completed,
            "avgProgress": avg_progress,
        })

    return {
        "role": "teacher",
        "courses": rows,
        "totals": {
            "courses": courses.count(),
            "students": total_students,
            "completions": total_completions,
        },
    }


def _admin_workspace():
    courses = Course.objects.all()
    learners = User.objects.filter(email_verified=True).count()
    teachers = User.objects.filter(role=User.Role.TEACHER).count()
    enrollments = Enrollment.objects.count()
    certificates = Certificate.objects.count()
    lessons_completed = LessonCompletion.objects.count()
    quiz_passes = QuizAttempt.objects.filter(passed=True).count()
    active_enrollments = Enrollment.objects.filter(completed_at__isnull=True).count()
    completed_enrollments = Enrollment.objects.filter(completed_at__isnull=False).count()

    top_courses = []
    for course in courses.annotate(
        student_count=Count("enrollments"),
        completion_count=Count("enrollments", filter=models.Q(enrollments__completed_at__isnull=False)),
    ).order_by("-student_count")[:8]:
        top_courses.append({
            "id": course.slug,
            "title": course.title,
            "students": course.student_count,
            "completions": course.completion_count,
            "free": course.free,
        })

    recent = list(
        Enrollment.objects.select_related("user", "course")
        .order_by("-enrolled_at")[:12]
        .values(
            "user__email",
            "course__slug",
            "course__title",
            "enrolled_at",
            "completed_at",
        )
    )

    recent_certs = list(
        Certificate.objects.select_related("user", "course")
        .order_by("-issued_at")[:8]
        .values(
            "certificate_id",
            "user__email",
            "course__title",
            "issued_at",
        )
    )

    return {
        "role": "admin",
        "platform": {
            "courses": courses.count(),
            "learners": learners,
            "teachers": teachers,
            "enrollments": enrollments,
            "activeEnrollments": active_enrollments,
            "completedEnrollments": completed_enrollments,
            "certificates": certificates,
            "lessonsCompleted": lessons_completed,
            "quizPasses": quiz_passes,
        },
        "topCourses": top_courses,
        "recentEnrollments": [
            {
                "email": r["user__email"],
                "courseId": r["course__slug"],
                "courseTitle": r["course__title"],
                "enrolledAt": r["enrolled_at"].isoformat() if r["enrolled_at"] else None,
                "completed": bool(r["completed_at"]),
            }
            for r in recent
        ],
        "recentCertificates": [
            {
                "id": str(c["certificate_id"]),
                "email": c["user__email"],
                "courseTitle": c["course__title"],
                "issuedAt": c["issued_at"].isoformat() if c["issued_at"] else None,
            }
            for c in recent_certs
        ],
    }


def _course_admin_row(course):
    teacher = course.teacher
    return {
        "id": course.slug,
        "title": course.title,
        "category": course.category,
        "instructor": course.instructor,
        "teacherId": str(teacher.pk) if teacher else None,
        "teacherEmail": teacher.email if teacher else None,
        "teacherName": teacher.display_name if teacher else None,
        "lessonCount": getattr(course, "lesson_count", course.lessons.count()),
        "students": getattr(course, "student_count", 0),
        "featured": course.featured,
        "free": course.free,
        "sortOrder": course.sort_order,
        "rating": float(course.rating),
    }


def _unique_slug(title):
    base = slugify(title)[:70] or "course"
    slug = base
    counter = 1
    while Course.objects.filter(slug=slug).exists():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


class AdminCourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.lms_role != User.Role.ADMIN:
            return Response({"detail": "Forbidden."}, status=403)

        rows = []
        for course in Course.objects.select_related("teacher").annotate(
            student_count=Count("enrollments"),
            lesson_count=Count("lessons"),
        ).order_by("sort_order", "title"):
            rows.append(_course_admin_row(course))
        return Response(rows)

    def post(self, request):
        if request.user.lms_role != User.Role.ADMIN:
            return Response({"detail": "Forbidden."}, status=403)

        data = request.data
        title = (data.get("title") or "").strip()
        category = (data.get("category") or "General").strip()
        description = (data.get("description") or "").strip() or f"Learn {title} with Barwaaqo Skills."
        instructor = (data.get("instructor") or request.user.display_name).strip()
        lessons_data = data.get("lessons") or []

        if not title:
            return Response({"detail": "Course title is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(lessons_data, list) or not lessons_data:
            return Response(
                {"detail": "Add at least one lesson with a title and YouTube video ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_lessons = [
            row for row in lessons_data
            if (row.get("title") or "").strip() and (row.get("videoId") or row.get("video_id") or "").strip()
        ]
        if not valid_lessons:
            return Response(
                {"detail": "Each lesson needs a title and YouTube video ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        teacher = None
        teacher_id = data.get("teacherId")
        if teacher_id:
            teacher = User.objects.filter(pk=teacher_id).first()
            if teacher:
                instructor = teacher.display_name

        first_video = ""
        for row in lessons_data:
            vid = (row.get("videoId") or row.get("video_id") or "").strip()
            if vid:
                first_video = vid
                break

        thumbnail = (data.get("thumbnailVideoId") or "").strip() or first_video or "c9Wg6Cb_YlU"
        avatar = (data.get("instructorAvatar") or "").strip() or instructor_avatar_url(instructor)

        slug = _unique_slug(data.get("slug") or title)

        with transaction.atomic():
            course = Course.objects.create(
                slug=slug,
                title=title,
                description=description,
                category=category,
                instructor=instructor,
                instructor_avatar=avatar,
                teacher=teacher,
                playlist_id=(data.get("playlistId") or "").strip()[:80],
                thumbnail_video_id=thumbnail[:20],
                badge=(data.get("badge") or "New")[:40] or None,
                badge_class=(data.get("badgeClass") or "badge-yellow")[:40] or None,
                featured=bool(data.get("featured", False)),
                free=bool(data.get("free", True)),
                sort_order=int(data.get("sortOrder") or 0),
            )
            created_lessons = create_course_lessons(course, valid_lessons)
            setup_course_quiz(course)
            create_default_roadmap(course, len(created_lessons))

        course.lesson_count = len(created_lessons)
        course.student_count = 0
        row = _course_admin_row(course)
        row["previewUrl"] = f"course-preview.html?id={course.slug}"
        row["learnUrl"] = f"course-learn.html?id={course.slug}"
        return Response(row, status=status.HTTP_201_CREATED)


class AdminCourseManageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, slug):
        if request.user.lms_role != User.Role.ADMIN:
            return Response({"detail": "Forbidden."}, status=403)

        try:
            course = Course.objects.get(slug=slug)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found."}, status=404)

        data = request.data
        update_fields = []
        if "featured" in data:
            course.featured = bool(data["featured"])
            update_fields.append("featured")
        if "free" in data:
            course.free = bool(data["free"])
            update_fields.append("free")
        if "sortOrder" in data:
            try:
                course.sort_order = max(0, int(data["sortOrder"]))
                update_fields.append("sort_order")
            except (TypeError, ValueError):
                return Response({"detail": "Invalid sort order."}, status=400)
        if "title" in data and data["title"].strip():
            course.title = data["title"].strip()
            update_fields.append("title")
        if "category" in data and data["category"].strip():
            course.category = data["category"].strip()
            update_fields.append("category")
        if "instructor" in data and data["instructor"].strip():
            course.instructor = data["instructor"].strip()
            update_fields.append("instructor")
        if "teacherId" in data:
            if data["teacherId"] in (None, "", "null"):
                course.teacher = None
                update_fields.append("teacher")
            else:
                teacher = User.objects.filter(pk=data["teacherId"]).first()
                if not teacher:
                    return Response({"detail": "Teacher not found."}, status=404)
                course.teacher = teacher
                course.instructor = teacher.display_name
                update_fields.extend(["teacher", "instructor"])

        if not update_fields:
            return Response({"detail": "No valid fields to update."}, status=400)

        course.save(update_fields=update_fields)
        return Response({
            "id": course.slug,
            "featured": course.featured,
            "free": course.free,
            "sortOrder": course.sort_order,
            "teacherId": str(course.teacher_id) if course.teacher_id else None,
            "instructor": course.instructor,
        })


class LMSOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.lms_role

        if role == User.Role.ADMIN:
            payload = _admin_workspace()
        elif role == User.Role.TEACHER:
            payload = _teacher_workspace(user)
        else:
            payload = _student_workspace(user)

        payload["role"] = role
        payload["user"] = {
            "name": user.display_name,
            "email": user.email,
        }
        return Response(payload)
