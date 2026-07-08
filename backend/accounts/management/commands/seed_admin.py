from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin@123"
ADMIN_NAME = "Admin"


class Command(BaseCommand):
    help = "Ensure default admin account exists (admin@gmail.com / admin@123)."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email=ADMIN_EMAIL,
            defaults={
                "username": ADMIN_EMAIL,
                "first_name": ADMIN_NAME,
                "role": User.Role.ADMIN,
                "email_verified": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        user.set_password(ADMIN_PASSWORD)
        user.username = ADMIN_EMAIL
        user.first_name = ADMIN_NAME
        user.role = User.Role.ADMIN
        user.email_verified = True
        user.is_staff = True
        user.is_superuser = True
        user.save()

        verb = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{verb} admin account: {ADMIN_EMAIL}"))
