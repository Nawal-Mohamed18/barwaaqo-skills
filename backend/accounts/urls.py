from django.urls import path

from .views import AvatarServeView, AvatarView, LoginView, MeView, ResendVerificationView, SignupView, VerifyEmailView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="auth-signup"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/avatar/", AvatarView.as_view(), name="auth-avatar"),
    path("avatars/<int:user_id>/", AvatarServeView.as_view(), name="auth-avatar-serve"),
    path("verify-email/", VerifyEmailView.as_view(), name="auth-verify"),
    path("resend-verification/", ResendVerificationView.as_view(), name="auth-resend"),
]
