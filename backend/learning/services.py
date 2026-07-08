from datetime import datetime, timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from payments.services import user_has_course_access

from .models import Certificate, CourseQuiz, Enrollment, LessonCompletion, QuizAttempt


LESSON_XP = 10
COURSE_COMPLETE_XP = 100


def compute_xp(user) -> int:
    lessons = LessonCompletion.objects.filter(user=user).count()
    courses_done = Enrollment.objects.filter(user=user, completed_at__isnull=False).count()
    return lessons * LESSON_XP + courses_done * COURSE_COMPLETE_XP


def activity_calendar(user, days: int = 140) -> list[dict]:
    """GitHub-style activity: lesson completions per day."""
    today = timezone.localdate()
    start = today - timedelta(days=days - 1)
    start_dt = timezone.make_aware(datetime.combine(start, datetime.min.time()))

    counted = (
        LessonCompletion.objects.filter(user=user, completed_at__gte=start_dt)
        .annotate(day=TruncDate("completed_at"))
        .values("day")
        .annotate(count=Count("id"))
    )
    counts = {row["day"].isoformat(): row["count"] for row in counted}

    out = []
    for i in range(days):
        day = start + timedelta(days=i)
        key = day.isoformat()
        out.append({"date": key, "count": counts.get(key, 0)})
    return out


def compute_streak(user) -> int:
    dates = (
        LessonCompletion.objects.filter(user=user)
        .dates("completed_at", "day", order="DESC")
    )
    if not dates:
        return 0

    streak = 0
    expected = timezone.localdate()
    for day in dates:
        if day == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif day == expected - timedelta(days=1) and streak == 0:
            expected = day
            streak += 1
            expected -= timedelta(days=1)
        else:
            break
    return streak


def all_lessons_complete(user, course) -> bool:
    total = course.lessons.count()
    if not total:
        return False
    done = LessonCompletion.objects.filter(user=user, course=course).count()
    return done >= total


def quiz_passed(user, course) -> bool:
    try:
        quiz = course.quiz
    except CourseQuiz.DoesNotExist:
        return True
    return QuizAttempt.objects.filter(user=user, quiz=quiz, passed=True).exists()


def issue_certificate(user, course):
    """Create a certificate for a completed course (idempotent)."""
    cert, created = Certificate.objects.get_or_create(
        user=user,
        course=course,
    )
    return cert, created


def try_finalize_course(user, course):
    enrollment = Enrollment.objects.filter(user=user, course=course).first()
    if not enrollment or enrollment.completed_at:
        if enrollment and enrollment.completed_at:
            issue_certificate(user, course)
        return enrollment

    if not all_lessons_complete(user, course):
        return enrollment
    if not quiz_passed(user, course):
        return enrollment

    enrollment.completed_at = timezone.now()
    enrollment.save(update_fields=["completed_at"])
    issue_certificate(user, course)
    return enrollment


def clear_course_progress(user, course):
    """Remove enrollment and all in-progress data for a course (keeps certificates)."""
    LessonCompletion.objects.filter(user=user, course=course).delete()
    LessonWatchProgress.objects.filter(user=user, course=course).delete()
    deleted, _ = Enrollment.objects.filter(user=user, course=course).delete()

    state = LearningState.objects.filter(user=user, last_course=course).first()
    if state:
        state.last_course = None
        state.last_lesson_number = 1
        state.save(update_fields=["last_course", "last_lesson_number"])

    return bool(deleted)


def require_course_access(user, course):
    if not user_has_course_access(user, course):
        return False, "access"
    return True, None
