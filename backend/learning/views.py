from django.conf import settings

from django.utils import timezone

from rest_framework import status

from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework.response import Response

from rest_framework.views import APIView



from courses.models import Course

from courses.serializers import parse_duration

from payments.services import get_purchased_course_slugs, user_has_course_access



from .models import Certificate, CourseQuiz, Enrollment, LearningState, LessonCompletion, LessonWatchProgress, QuizAttempt

from .services import (
    activity_calendar,
    clear_course_progress,
    compute_streak,
    compute_xp,
    issue_certificate,
    quiz_passed,
    require_course_access,
    try_finalize_course,
)





def _active_enrollments(user):

    return Enrollment.objects.filter(user=user, completed_at__isnull=True).select_related("course")





def _duration_seconds(duration_str):

    parts = [int(p) for p in str(duration_str).split(":")]

    if len(parts) == 3:

        return parts[0] * 3600 + parts[1] * 60 + parts[2]

    if len(parts) == 2:

        return parts[0] * 60 + parts[1]

    return 300





def _course_progress(user, course):

    completed = set(

        LessonCompletion.objects.filter(user=user, course=course)

        .values_list("lesson_number", flat=True)

    )

    lessons = list(course.lessons.all())

    total = len(lessons)

    watches = {

        row.lesson_number: row.watch_seconds

        for row in LessonWatchProgress.objects.filter(user=user, course=course)

    }

    total_seconds = sum(_duration_seconds(lesson.duration) for lesson in lessons) or 1

    watched_seconds = 0

    for lesson in lessons:

        lesson_seconds = _duration_seconds(lesson.duration)

        if lesson.lesson_number in completed:

            watched_seconds += lesson_seconds

        elif lesson.lesson_number in watches:

            watched_seconds += min(watches[lesson.lesson_number], lesson_seconds)

    pct = round((watched_seconds / total_seconds) * 100) if total else 0

    return {

        "completedLessons": sorted(completed),

        "totalLessons": total,

        "percent": min(pct, 100),

        "lessonWatches": {str(num): sec for num, sec in watches.items()},

    }





def _certificate_payload(user):

    certs = Certificate.objects.filter(user=user).select_related("course")

    return [

        {

            "id": str(c.certificate_id),

            "courseId": c.course.slug,

            "courseTitle": c.course.title,

            "issuedAt": c.issued_at.isoformat(),

        }

        for c in certs

    ]





def _build_state(user):

    enrollments = Enrollment.objects.filter(user=user).select_related("course")

    enrolled_ids = [e.course.slug for e in enrollments]

    completed_ids = [e.course.slug for e in enrollments if e.completed_at]

    active_count = len([e for e in enrollments if not e.completed_at])



    state, _ = LearningState.objects.get_or_create(user=user)

    last_payload = None

    if state.last_course_id:

        last_payload = {

            "courseId": state.last_course.slug,

            "lessonId": state.last_lesson_number,

            "updatedAt": int(state.updated_at.timestamp() * 1000),

        }



    progress = {}

    minutes = 0

    for e in enrollments:

        course = e.course

        prog = _course_progress(user, course)

        progress[course.slug] = prog

        lessons = list(course.lessons.all())

        lesson_map = {l.lesson_number: l for l in lessons}

        for num in prog["completedLessons"]:

            lesson = lesson_map.get(num)

            if lesson:

                minutes += parse_duration(lesson.duration)



    return {

        "enrolled": enrolled_ids,

        "completed": completed_ids,

        "purchased": get_purchased_course_slugs(user),

        "last": last_payload,

        "progress": progress,

        "activity": activity_calendar(user),

        "certificates": _certificate_payload(user),

        "stats": {

            "enrolled": len(enrolled_ids),

            "active": active_count,

            "slots": settings.MAX_ENROLLED_COURSES,

            "completed": len(completed_ids),

            "hours": f"{minutes / 60:.1f}",

            "streak": compute_streak(user),

            "xp": compute_xp(user),

        },

    }





class LearningStateView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request):

        return Response(_build_state(request.user))





class EnrollView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request):

        course_id = request.data.get("course_id")

        try:

            course = Course.objects.get(slug=course_id)

        except Course.DoesNotExist:

            return Response({"ok": False, "message": "Course not found."}, status=404)



        existing = Enrollment.objects.filter(user=request.user, course=course).first()

        if existing:

            return Response({"ok": True})



        active = _active_enrollments(request.user).count()

        if active >= settings.MAX_ENROLLED_COURSES:

            return Response(

                {

                    "ok": False,

                    "error": "limit",

                    "message": (

                        f"You can only take {settings.MAX_ENROLLED_COURSES} courses at a time. "

                        "Finish or leave a course in My Courses to free a slot."

                    ),

                },

                status=status.HTTP_400_BAD_REQUEST,

            )



        Enrollment.objects.create(user=request.user, course=course)

        return Response({"ok": True})





class UnenrollView(APIView):

    permission_classes = [IsAuthenticated]



    def delete(self, request, course_id):

        try:

            course = Course.objects.get(slug=course_id)

        except Course.DoesNotExist:

            return Response({"ok": False}, status=404)



        if not clear_course_progress(request.user, course):

            return Response({"ok": False, "detail": "Not enrolled."}, status=404)

        return Response({"ok": True, "state": _build_state(request.user)})





class SaveLastView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request):

        course_id = request.data.get("course_id")

        lesson_id = request.data.get("lesson_id")

        try:

            course = Course.objects.get(slug=course_id)

        except Course.DoesNotExist:

            return Response({"detail": "Course not found."}, status=404)



        ok, err = require_course_access(request.user, course)

        if not ok:

            return Response(

                {

                    "ok": False,

                    "error": err,

                    "message": f"Purchase this course (${course.price_cents / 100:.0f}) to continue learning.",

                    "price_cents": course.price_cents,

                },

                status=status.HTTP_402_PAYMENT_REQUIRED,

            )



        state, _ = LearningState.objects.get_or_create(user=request.user)

        state.last_course = course

        state.last_lesson_number = int(lesson_id)

        state.save()



        if not Enrollment.objects.filter(user=request.user, course=course).exists():

            return Response(

                {

                    "ok": False,

                    "error": "not_enrolled",

                    "message": "Enroll in this course before saving progress.",

                },

                status=status.HTTP_403_FORBIDDEN,

            )



        return Response({"ok": True, "progress": _course_progress(request.user, course)})





class SaveWatchView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request):

        course_id = request.data.get("course_id")

        lesson_id = request.data.get("lesson_id")

        watch_seconds = int(request.data.get("watch_seconds") or 0)



        try:

            course = Course.objects.get(slug=course_id)

        except Course.DoesNotExist:

            return Response({"detail": "Course not found."}, status=404)



        ok, err = require_course_access(request.user, course)

        if not ok:

                return Response(

                    {

                        "ok": False,

                    "error": err,

                    "message": f"Purchase this course (${course.price_cents / 100:.0f}) to continue learning.",

                    "price_cents": course.price_cents,

                },

                status=status.HTTP_402_PAYMENT_REQUIRED,

            )



        if LessonCompletion.objects.filter(

            user=request.user, course=course, lesson_number=int(lesson_id)

        ).exists():

            return Response({"ok": True, "progress": _course_progress(request.user, course)})



        LessonWatchProgress.objects.update_or_create(

            user=request.user,

            course=course,

            lesson_number=int(lesson_id),

            defaults={"watch_seconds": max(0, watch_seconds)},

        )



        return Response({"ok": True, "progress": _course_progress(request.user, course)})





class CompleteLessonView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request):

        course_id = request.data.get("course_id")

        lesson_id = int(request.data.get("lesson_id"))

        try:

            course = Course.objects.get(slug=course_id)

        except Course.DoesNotExist:

            return Response({"detail": "Course not found."}, status=404)



        ok, err = require_course_access(request.user, course)

        if not ok:

            return Response(

                {"ok": False, "error": err, "message": "Purchase required to track progress."},

                status=status.HTTP_402_PAYMENT_REQUIRED,

            )



        if not course.lessons.filter(lesson_number=lesson_id).exists():

            return Response({"detail": "Lesson not found."}, status=404)



        if not Enrollment.objects.filter(user=request.user, course=course).exists():

            return Response({"detail": "Not enrolled."}, status=404)



        LessonCompletion.objects.get_or_create(

            user=request.user,

            course=course,

            lesson_number=lesson_id,

        )



        state, _ = LearningState.objects.get_or_create(user=request.user)

        state.last_course = course

        state.last_lesson_number = lesson_id

        state.save()



        try_finalize_course(request.user, course)

        payload = _build_state(request.user)

        all_lessons_done = _course_progress(request.user, course)["percent"] >= 100

        needs_quiz = all_lessons_done and not quiz_passed(request.user, course) and CourseQuiz.objects.filter(course=course).exists()



        return Response({

            "ok": True,

            "progress": payload["progress"].get(course.slug),

            "completed": course.slug in payload["completed"],

            "needsQuiz": needs_quiz,

            "stats": payload["stats"],

            "activity": payload["activity"],

        })





class CompleteCourseView(APIView):

    """Admin-only shortcut — learners must complete lessons and pass the quiz."""



    permission_classes = [IsAuthenticated]



    def post(self, request):

        if not request.user.is_staff:

            return Response(

                {"detail": "Complete lessons and pass the course quiz to earn your certificate."},

                status=403,

            )

        course_id = request.data.get("course_id")

        try:

            enrollment = Enrollment.objects.get(user=request.user, course__slug=course_id)

            course = enrollment.course

        except Enrollment.DoesNotExist:

            return Response({"detail": "Not enrolled."}, status=404)



        for lesson in course.lessons.all():

            LessonCompletion.objects.get_or_create(

                user=request.user,

                course=course,

                lesson_number=lesson.lesson_number,

            )



        enrollment.completed_at = timezone.now()

        enrollment.save(update_fields=["completed_at"])

        cert, _ = issue_certificate(request.user, course)

        return Response({

            "ok": True,

            "progress": _course_progress(request.user, course),

            "certificateId": str(cert.certificate_id),

        })





class CourseQuizView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request, course_id):

        try:

            course = Course.objects.get(slug=course_id)

        except Course.DoesNotExist:

            return Response({"detail": "Course not found."}, status=404)



        if not user_has_course_access(request.user, course):

            return Response({"detail": "Purchase required."}, status=402)



        try:

            quiz = course.quiz

        except CourseQuiz.DoesNotExist:

            return Response({"hasQuiz": False})



        questions = [

            {"id": q.id, "text": q.text, "options": q.options}

            for q in quiz.questions.all()

        ]

        passed = QuizAttempt.objects.filter(user=request.user, quiz=quiz, passed=True).exists()

        best = (

            QuizAttempt.objects.filter(user=request.user, quiz=quiz)

            .order_by("-score_percent")

            .first()

        )



        return Response({

            "hasQuiz": True,

            "title": quiz.title,

            "passingScore": quiz.passing_score,

            "questions": questions,

            "passed": passed,

            "bestScore": best.score_percent if best else None,

        })





class SubmitQuizView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request, course_id):

        try:

            course = Course.objects.get(slug=course_id)

            quiz = course.quiz

        except (Course.DoesNotExist, CourseQuiz.DoesNotExist):

            return Response({"detail": "Quiz not found."}, status=404)



        if not Enrollment.objects.filter(user=request.user, course=course).exists():

            return Response({"detail": "Enroll first."}, status=403)



        progress = _course_progress(request.user, course)

        if progress["percent"] < 100:

            return Response(

                {"detail": "Complete all lessons before taking the assessment."},

                status=400,

            )



        answers = request.data.get("answers") or {}

        questions = list(quiz.questions.all())

        if not questions:

            return Response({"detail": "Quiz has no questions."}, status=400)



        correct = 0

        for q in questions:

            chosen = answers.get(str(q.id))

            if chosen is not None and int(chosen) == q.correct_index:

                correct += 1



        score = round((correct / len(questions)) * 100)

        passed = score >= quiz.passing_score



        QuizAttempt.objects.create(

            user=request.user,

            quiz=quiz,

            score_percent=score,

            passed=passed,

            answers=answers,

        )



        if passed:

            try_finalize_course(request.user, course)



        cert = Certificate.objects.filter(user=request.user, course=course).first()



        return Response({

            "ok": True,

            "score": score,

            "passed": passed,

            "passingScore": quiz.passing_score,

            "courseCompleted": passed and course.slug in _build_state(request.user)["completed"],

            "certificateId": str(cert.certificate_id) if cert else None,

        })





class CertificatesListView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request):

        return Response({"certificates": _certificate_payload(request.user)})





class CertificateVerifyView(APIView):

    permission_classes = [AllowAny]



    def get(self, request, certificate_id):

        try:

            cert = Certificate.objects.select_related("user", "course").get(

                certificate_id=certificate_id

            )

        except Certificate.DoesNotExist:

            return Response({"valid": False}, status=404)



        return Response({

            "valid": True,

            "certificateId": str(cert.certificate_id),

            "courseTitle": cert.course.title,

            "courseId": cert.course.slug,

            "studentName": cert.user.get_full_name() or cert.user.email,

            "issuedAt": cert.issued_at.isoformat(),

        })


