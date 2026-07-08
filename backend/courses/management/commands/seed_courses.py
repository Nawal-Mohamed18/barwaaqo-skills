import json
from pathlib import Path

from django.core.management.base import BaseCommand

from courses.models import Course, Lesson, RoadmapPhase


class Command(BaseCommand):
    help = "Seed the database with Barwaaqo Skills courses"

    def handle(self, *args, **options):
        path = Path(__file__).resolve().parents[2] / "seed_data.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        created = 0
        updated = 0

        for i, item in enumerate(data):
            course, was_created = Course.objects.update_or_create(
                slug=item["id"],
                defaults={
                    "title": item["title"],
                    "description": item["description"],
                    "category": item["category"],
                    "instructor": item["instructor"],
                    "instructor_avatar": item["instructorAvatar"],
                    "playlist_id": item["playlistId"],
                    "thumbnail_video_id": item["thumbnailVideoId"],
                    "rating": item["rating"],
                    "review_count": item["reviewCount"],
                    "badge": item.get("badge"),
                    "badge_class": item.get("badgeClass"),
                    "featured": item.get("featured", False),
                    "free": item.get("free", True),
                    "sort_order": i,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

            course.lessons.all().delete()
            for lesson in item["lessons"]:
                Lesson.objects.create(
                    course=course,
                    lesson_number=lesson["id"],
                    title=lesson["title"],
                    video_id=lesson["videoId"],
                    duration=lesson["duration"],
                )

            course.roadmap_phases.all().delete()
            for j, phase in enumerate(item.get("roadmap", [])):
                RoadmapPhase.objects.create(
                    course=course,
                    phase=phase["phase"],
                    from_lesson=phase["from"],
                    to_lesson=phase["to"],
                    goal=phase["goal"],
                    sort_order=j,
                )

        self.stdout.write(
            self.style.SUCCESS(f"Seed complete: {created} created, {updated} updated ({len(data)} total)")
        )
