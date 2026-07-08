from django.contrib import admin

from .models import Certificate, CourseQuiz, Enrollment, LearningState, LessonCompletion, QuizAttempt, QuizQuestion, SiteVisit


@admin.register(LessonCompletion)
class LessonCompletionAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "lesson_number", "completed_at")
    list_filter = ("course",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "enrolled_at", "completed_at")
    list_filter = ("completed_at",)


@admin.register(LearningState)
class LearningStateAdmin(admin.ModelAdmin):
    list_display = ("user", "last_course", "last_lesson_number", "updated_at")


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1


@admin.register(CourseQuiz)
class CourseQuizAdmin(admin.ModelAdmin):
    list_display = ("course", "title", "passing_score")
    inlines = [QuizQuestionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "quiz", "score_percent", "passed", "submitted_at")
    list_filter = ("passed",)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_id", "user", "course", "issued_at")
    search_fields = ("certificate_id", "user__email", "course__slug")
    readonly_fields = ("certificate_id", "issued_at")


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ("page_path", "user", "visited_at")
    list_filter = ("visited_at",)
    search_fields = ("page_path", "user__email", "session_key")
    readonly_fields = ("visited_at",)
