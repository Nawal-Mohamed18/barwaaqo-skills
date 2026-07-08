from django.conf import settings
from django.db import models
import uuid

from accounts.models import User
from courses.models import Course


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = [("user", "course")]

    @property
    def is_completed(self):
        return self.completed_at is not None


class LearningState(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="learning_state")
    last_course = models.ForeignKey(
        Course, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    last_lesson_number = models.PositiveSmallIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)


class LessonCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lesson_completions")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lesson_completions")
    lesson_number = models.PositiveSmallIntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "course", "lesson_number")]
        ordering = ["lesson_number"]


class LessonWatchProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lesson_watch_progress")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lesson_watch_progress")
    lesson_number = models.PositiveSmallIntegerField()
    watch_seconds = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("user", "course", "lesson_number")]
        ordering = ["lesson_number"]


class CourseQuiz(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name="quiz")
    title = models.CharField(max_length=200, default="Course Assessment")
    passing_score = models.PositiveSmallIntegerField(default=70, help_text="Minimum percent to pass")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz — {self.course.slug}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(CourseQuiz, on_delete=models.CASCADE, related_name="questions")
    text = models.CharField(max_length=500)
    options = models.JSONField(default=list)
    correct_index = models.PositiveSmallIntegerField()
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.text[:60]


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_attempts")
    quiz = models.ForeignKey(CourseQuiz, on_delete=models.CASCADE, related_name="attempts")
    score_percent = models.PositiveSmallIntegerField()
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]


class Certificate(models.Model):
    certificate_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificates")
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "course")]
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.user.email} — {self.course.slug}"
