from django.conf import settings
from django.db import models


class Course(models.Model):
    slug = models.SlugField(unique=True, max_length=80)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=60)
    instructor = models.CharField(max_length=120)
    instructor_avatar = models.URLField(max_length=500)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teaching_courses",
    )
    playlist_id = models.CharField(max_length=80)
    thumbnail_video_id = models.CharField(max_length=20)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    review_count = models.PositiveIntegerField(default=0)
    badge = models.CharField(max_length=40, blank=True, null=True)
    badge_class = models.CharField(max_length=40, blank=True, null=True)
    featured = models.BooleanField(default=False)
    free = models.BooleanField(default=True)
    price_cents = models.PositiveIntegerField(default=4900, help_text="Premium price in USD cents")
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, related_name="lessons", on_delete=models.CASCADE)
    lesson_number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=200)
    video_id = models.CharField(max_length=20)
    duration = models.CharField(max_length=12)

    class Meta:
        ordering = ["lesson_number"]
        unique_together = [("course", "lesson_number")]

    def __str__(self):
        return f"{self.course.slug} — {self.title}"


class RoadmapPhase(models.Model):
    course = models.ForeignKey(Course, related_name="roadmap_phases", on_delete=models.CASCADE)
    phase = models.CharField(max_length=120)
    from_lesson = models.PositiveSmallIntegerField()
    to_lesson = models.PositiveSmallIntegerField()
    goal = models.CharField(max_length=255)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]
