from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Delete all learner accounts (keeps superusers). Fresh start for email verification."

    def add_arguments(self, parser):
        parser.add_argument(
            "--include-staff",
            action="store_true",
            help="Also delete staff users (not superusers).",
        )

    def handle(self, *args, **options):
        qs = User.objects.filter(is_superuser=False)
        if not options["include_staff"]:
            qs = qs.filter(is_staff=False)
        count = qs.count()
        qs.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} account(s)."))
