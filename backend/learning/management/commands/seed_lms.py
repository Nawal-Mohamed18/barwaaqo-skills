from django.core.management.base import BaseCommand

from courses.models import Course, Lesson
from learning.course_setup import create_course_lessons, instructor_avatar_url, setup_course_quiz
from learning.models import CourseQuiz, QuizQuestion


def build_questions(course):
    from learning.course_setup import build_quiz_questions
    return build_quiz_questions(course)


class Command(BaseCommand):
    help = "Create course quizzes for LMS assessments"

    def handle(self, *args, **options):
        created_quizzes = 0
        created_questions = 0

        for course in Course.objects.prefetch_related("lessons").all():
            quiz, q_created = CourseQuiz.objects.get_or_create(
                course=course,
                defaults={
                    "title": f"{course.title} — Final Assessment",
                    "passing_score": 70,
                },
            )
            if q_created:
                created_quizzes += 1

            if quiz.questions.exists():
                continue

            for i, (text, options, correct) in enumerate(build_questions(course)):
                QuizQuestion.objects.create(
                    quiz=quiz,
                    text=text,
                    options=options,
                    correct_index=correct,
                    sort_order=i,
                )
                created_questions += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"LMS quizzes ready — {created_quizzes} new quizzes, {created_questions} questions added."
            )
        )
