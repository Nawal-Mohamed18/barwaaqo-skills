import secrets

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        TEACHER = "teacher", "Teacher"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)
    verify_token = models.CharField(max_length=64, blank=True, null=True)
    verify_token_expires = models.DateTimeField(blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    class LearningPath(models.TextChoices):
        CODING = "coding", "Coding & Tech"
        DESIGN = "design", "Design & Creative"
        BUSINESS = "business", "Business & Career"
        PERSONAL = "personal", "Personal Growth"

    learning_path = models.CharField(
        max_length=20,
        choices=LearningPath.choices,
        default=LearningPath.CODING,
        blank=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name"]

    @property
    def display_name(self):
        return self.first_name or self.username

    @property
    def lms_role(self):
        if self.is_staff or self.is_superuser:
            return self.Role.ADMIN
        return self.role

    def issue_verify_token(self):
        from django.utils import timezone
        from datetime import timedelta

        self.verify_token = secrets.token_hex(16)
        self.verify_token_expires = timezone.now() + timedelta(hours=24)
        self.save(update_fields=["verify_token", "verify_token_expires"])
        return self.verify_token

    def mark_verified(self):
        self.email_verified = True
        self.verify_token = None
        self.verify_token_expires = None
        self.save(update_fields=["email_verified", "verify_token", "verify_token_expires"])

    def verify_token_valid(self, token: str) -> bool:
        from django.utils import timezone

        if not self.verify_token or self.verify_token != token:
            return False
        if self.verify_token_expires and timezone.now() > self.verify_token_expires:
            return False
        return True
