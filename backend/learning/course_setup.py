"""Create courses with lessons and assessment quiz (same structure as seeded courses)."""

from courses.models import Course, Lesson
from learning.models import CourseQuiz, QuizQuestion


def build_quiz_questions(course):
    lessons = list(course.lessons.all()[:5])
    category = course.category
    title = course.title

    templates = [
        (
            f"What is the primary focus of \"{title}\"?",
            [
                f"Building practical {category.lower()} skills",
                "Memorizing unrelated theory only",
                "Skipping hands-on practice",
                "Avoiding real-world examples",
            ],
            0,
        ),
        (
            f"Which best describes the learning approach in this {category} course?",
            [
                "Step-by-step lessons with clear outcomes",
                "Random topics with no structure",
                "No instructor guidance",
                "Only reading, no video content",
            ],
            0,
        ),
        (
            "Why should you complete every lesson before the final assessment?",
            [
                "Each lesson builds skills needed for the next topic",
                "Lessons are optional decorations",
                "The quiz is unrelated to lesson content",
                "Progress tracking is not useful",
            ],
            0,
        ),
        (
            f"A learner finishing \"{title}\" should be able to:",
            [
                f"Apply {category.lower()} concepts from the course roadmap",
                "Ignore the course roadmap entirely",
                "Skip practice and still be job-ready",
                "Avoid using any tools shown in lessons",
            ],
            0,
        ),
        (
            "What is the recommended way to succeed in this course?",
            [
                "Watch each lesson, practice, then mark it complete",
                "Jump to the last lesson immediately",
                "Never review completed material",
                "Avoid taking notes during lessons",
            ],
            0,
        ),
    ]

    if lessons:
        l0 = lessons[0]
        templates[0] = (
            f"What is covered in \"{l0.title}\" (Lesson {l0.lesson_number})?",
            [
                f"Core concepts from early {category.lower()} lessons",
                "Unrelated advanced topics from another field",
                "Only administrative course setup",
                "Nothing — it is a placeholder lesson",
            ],
            0,
        )

    return templates


def setup_course_quiz(course):
    quiz, created = CourseQuiz.objects.get_or_create(
        course=course,
        defaults={
            "title": f"{course.title} — Final Assessment",
            "passing_score": 70,
        },
    )
    if not created and quiz.questions.exists():
        return quiz

    if quiz.questions.exists():
        return quiz

    for i, (text, options, correct) in enumerate(build_quiz_questions(course)):
        QuizQuestion.objects.create(
            quiz=quiz,
            text=text,
            options=options,
            correct_index=correct,
            sort_order=i,
        )
    return quiz


def create_course_lessons(course, lessons_data):
    created = []
    for i, row in enumerate(lessons_data, start=1):
        title = (row.get("title") or "").strip()
        video_id = (row.get("videoId") or row.get("video_id") or "").strip()
        duration = (row.get("duration") or "10:00").strip()
        if not title or not video_id:
            continue
        lesson = Lesson.objects.create(
            course=course,
            lesson_number=i,
            title=title,
            video_id=video_id[:20],
            duration=duration[:12],
        )
        created.append(lesson)
    return created


def create_default_roadmap(course, lesson_count):
    from courses.models import RoadmapPhase

    if lesson_count <= 0 or course.roadmap_phases.exists():
        return

    category = (course.category or "skills").lower()
    if lesson_count <= 2:
        RoadmapPhase.objects.create(
            course=course,
            phase="Phase 1 — Core",
            from_lesson=1,
            to_lesson=lesson_count,
            goal=f"Master the fundamentals covered in {course.title}.",
        )
        return

    mid = max(1, lesson_count // 2)
    RoadmapPhase.objects.create(
        course=course,
        phase="Phase 1 — Basics",
        from_lesson=1,
        to_lesson=mid,
        goal=f"Build a solid foundation in {category}.",
    )
    RoadmapPhase.objects.create(
        course=course,
        phase="Phase 2 — Practice",
        from_lesson=mid + 1,
        to_lesson=lesson_count,
        goal="Apply what you learned and finish with the final assessment.",
    )


def instructor_avatar_url(name):
    from urllib.parse import quote

    label = quote((name or "Instructor")[:40])
    return f"https://ui-avatars.com/api/?name={label}&background=0B1D33&color=FFD233"
