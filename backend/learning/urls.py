from django.urls import path



from .admin_api import (
    AdminEnrollmentListView,
    AdminEnrollmentManageView,
    AdminSystemActivityView,
    AdminTeacherListView,
    AdminUserListView,
    AdminUserManageView,
)
from .chat_views import SharshabeelChatView
from .lms_views import AdminCourseListView, AdminCourseManageView, LMSOverviewView
from .views import (

    CertificateVerifyView,

    CertificatesListView,

    CompleteCourseView,

    CompleteLessonView,

    CourseQuizView,

    EnrollView,

    LearningStateView,

    SaveLastView,

    SaveWatchView,

    SubmitQuizView,

    UnenrollView,

    RecordVisitView,

)



urlpatterns = [

    path("state/", LearningStateView.as_view(), name="learning-state"),
    path("lms/overview/", LMSOverviewView.as_view(), name="lms-overview"),
    path("lms/courses/", AdminCourseListView.as_view(), name="lms-admin-courses"),
    path("lms/courses/<slug:slug>/", AdminCourseManageView.as_view(), name="lms-admin-course-manage"),
    path("lms/users/", AdminUserListView.as_view(), name="lms-admin-users"),
    path("lms/users/<int:user_id>/", AdminUserManageView.as_view(), name="lms-admin-user-manage"),
    path("lms/teachers/", AdminTeacherListView.as_view(), name="lms-admin-teachers"),
    path("lms/enrollments/", AdminEnrollmentListView.as_view(), name="lms-admin-enrollments"),
    path("lms/system/", AdminSystemActivityView.as_view(), name="lms-admin-system"),
    path(
        "lms/enrollments/<int:user_id>/<slug:course_slug>/",
        AdminEnrollmentManageView.as_view(),
        name="lms-admin-enrollment-manage",
    ),

    path("enroll/", EnrollView.as_view(), name="learning-enroll"),

    path("enroll/<slug:course_id>/", UnenrollView.as_view(), name="learning-unenroll"),

    path("last/", SaveLastView.as_view(), name="learning-last"),

    path("watch/", SaveWatchView.as_view(), name="learning-watch"),

    path("visits/", RecordVisitView.as_view(), name="learning-visits"),

    path("sharshabeel/", SharshabeelChatView.as_view(), name="learning-sharshabeel"),

    path("lesson-complete/", CompleteLessonView.as_view(), name="learning-lesson-complete"),

    path("complete/", CompleteCourseView.as_view(), name="learning-complete"),

    path("quiz/<slug:course_id>/", CourseQuizView.as_view(), name="learning-quiz"),

    path("quiz/<slug:course_id>/submit/", SubmitQuizView.as_view(), name="learning-quiz-submit"),

    path("certificates/", CertificatesListView.as_view(), name="learning-certificates"),

    path("certificates/verify/<uuid:certificate_id>/", CertificateVerifyView.as_view(), name="certificate-verify"),

]


