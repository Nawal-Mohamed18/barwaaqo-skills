from django.core.management.base import BaseCommand

from courses.models import Course


class Command(BaseCommand):
    help = "Mark every course as free (no premium locks)."

    def handle(self, *args, **options):
        updated = Course.objects.exclude(free=True).update(free=True, price_cents=0)
        self.stdout.write(self.style.SUCCESS(f"Updated {updated} course(s) to free."))
