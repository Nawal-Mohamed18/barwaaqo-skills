def parse_duration(duration_str):
    parts = [int(p) for p in str(duration_str).split(":")]
    if len(parts) == 3:
        return parts[0] * 60 + parts[1] + parts[2] / 60
    if len(parts) == 2:
        return parts[0] + parts[1] / 60
    return 0


def format_hours(minutes):
    if minutes >= 60:
        return f"{minutes / 60:.1f} hrs"
    return f"{int(round(minutes))} min"


def serialize_course(course):
    lessons = list(course.lessons.all())
    minutes = sum(parse_duration(l.duration) for l in lessons)
    roadmap = [
        {
            "phase": p.phase,
            "from": p.from_lesson,
            "to": p.to_lesson,
            "goal": p.goal,
        }
        for p in course.roadmap_phases.all()
    ]
    return {
        "id": course.slug,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "instructor": course.instructor,
        "instructorAvatar": course.instructor_avatar,
        "playlistId": course.playlist_id,
        "thumbnailVideoId": course.thumbnail_video_id,
        "rating": float(course.rating),
        "reviewCount": course.review_count,
        "badge": course.badge,
        "badgeClass": course.badge_class,
        "featured": course.featured,
        "free": course.free,
        "priceCents": course.price_cents,
        "priceLabel": f"${course.price_cents / 100:.0f}" if not course.free else "Free",
        "lessons": [
            {
                "id": l.lesson_number,
                "title": l.title,
                "videoId": l.video_id,
                "duration": l.duration,
            }
            for l in lessons
        ],
        "roadmap": roadmap,
        "lessonCount": len(lessons),
        "totalMinutes": int(round(minutes)),
        "totalHours": f"{minutes / 60:.1f}",
        "durationLabel": format_hours(minutes),
    }
