"""شرشبيل — Barwaaqo Skills assistant (rule-based + optional OpenAI)."""
import os
import re

from courses.models import Course


BOT_NAME = "شرشبيل"

FAQ_ENTRIES = [
    {
        "keys": ["experience", "prior experience", "beginner", "start from zero"],
        "answer": (
            "No prior experience is needed. Many courses are beginner-friendly and take you step by step "
            "from basics to job-ready skills."
        ),
    },
    {
        "keys": ["xp", "points", "streak"],
        "answer": (
            "You earn 10 XP per lesson completed and 100 XP when you finish a course. "
            "Your XP and streak appear on your dashboard."
        ),
    },
    {
        "keys": ["pace", "own time", "schedule", "self-paced"],
        "answer": "All courses are self-paced — study whenever it fits your schedule.",
    },
    {
        "keys": ["free", "cost", "price", "pay"],
        "answer": (
            "All courses are free. Create an account, verify your email, and enroll in up to 3 courses at a time."
        ),
    },
    {
        "keys": ["enroll", "how many", "3 course", "slot", "enrollment limit"],
        "answer": (
            "You can actively enroll in up to 3 courses. Finish a course or unenroll from My Courses to free a slot."
        ),
    },
    {
        "keys": ["certificate", "cert"],
        "answer": (
            "Complete all lessons, pass the final quiz, and you earn a certificate you can verify on the site."
        ),
    },
    {
        "keys": ["verify email", "email verification", "verification"],
        "answer": (
            "After signup, check your email for a verification link. You must verify before enrolling in courses."
        ),
    },
    {
        "keys": ["quiz", "assessment", "pass"],
        "answer": "Each course has a final quiz. You need 70% or higher to pass and unlock your certificate.",
    },
]


def _normalize(text):
    return re.sub(r"\s+", " ", (text or "").lower().strip())


def _match_any(text, keywords):
    return any(k in text for k in keywords)


def _course_list(limit=8):
    return list(Course.objects.order_by("sort_order", "title")[:limit])


def _search_courses(query, limit=5):
    from django.db.models import Q

    qs = Course.objects.all()
    if query:
        qs = qs.filter(Q(title__icontains=query) | Q(category__icontains=query))
    return list(qs.order_by("sort_order", "title")[:limit])


def _user_role(user):
    if not user or not user.is_authenticated:
        return "guest"
    return getattr(user, "lms_role", None) or getattr(user, "role", "student")


def _greeting(user):
    role = _user_role(user)
    if role == "admin":
        return (
            f"Salaam! I'm {BOT_NAME}, your platform assistant. "
            "I can help with the admin dashboard, users, courses, enrollments, and site navigation."
        )
    if role == "teacher":
        return (
            f"Salaam! I'm {BOT_NAME}. I can help you manage courses, understand enrollments, "
            "and guide learners on Barwaaqo Skills."
        )
    if role == "student":
        name = user.display_name if user else "there"
        return (
            f"Salaam {name}! I'm {BOT_NAME}. Ask me about your courses, XP, certificates, "
            "or where to go next on the platform."
        )
    return (
        f"Salaam! I'm {BOT_NAME}, the Barwaaqo Skills helper. "
        "I can explain our free courses, signup, and how learning works here."
    )


def _suggestions_for_role(role):
    if role == "admin":
        return [
            "Open admin dashboard",
            "Manage students",
            "View system activity",
            "Add a new course",
        ]
    if role == "teacher":
        return [
            "Browse courses",
            "How do certificates work?",
            "Enrollment limit",
            "Go to my profile",
        ]
    if role == "student":
        return [
            "Resume my course",
            "How does XP work?",
            "Browse courses",
            "Get a certificate",
        ]
    return [
        "How do I sign up?",
        "Are courses free?",
        "Browse courses",
        "What is Barwaaqo Skills?",
    ]


def _try_openai(message, user, page_path, history):
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        from openai import OpenAI

        role = _user_role(user)
        courses = ", ".join(c.title for c in _course_list(12)) or "web development, design, business"
        system = f"""You are {BOT_NAME}, the friendly AI assistant for Barwaaqo Skills — a free online learning platform.
User role: {role}. Current page: {page_path or "unknown"}.
Courses include: {courses}.
Rules: all courses are free; max 3 active enrollments; email verification required; 10 XP per lesson, 100 per course; certificates after quiz pass.
Answer clearly in the user's language if they write in Somali or Arabic, otherwise English. Keep answers concise (2-4 sentences). Be warm and helpful."""

        messages = [{"role": "system", "content": system}]
        for item in (history or [])[-6:]:
            role_key = "user" if item.get("role") == "user" else "assistant"
            content = (item.get("content") or "").strip()
            if content:
                messages.append({"role": role_key, "content": content})
        messages.append({"role": "user", "content": message})

        client = OpenAI(api_key=api_key)
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            max_tokens=350,
            temperature=0.6,
        )
        text = (resp.choices[0].message.content or "").strip()
        return text if text else None
    except Exception:
        return None


def _rule_reply(message, user, page_path):
    text = _normalize(message)
    role = _user_role(user)

    if not text or text in {"hi", "hello", "hey", "salaam", "asc", "asalamu alaykum"}:
        return _greeting(user)

    if _match_any(text, ["who are you", "your name", "sharshabeel", "شرشبيل"]):
        return (
            f"I'm {BOT_NAME} — the Barwaaqo Skills assistant. "
            "I help guests, students, teachers, and admins find answers and navigate the platform."
        )

    if _match_any(text, ["barwaaqo", "what is this", "about platform", "about site"]):
        return (
            "Barwaaqo Skills is a free learning platform with career-focused courses in coding, design, "
            "business, and personal growth. Learn at your own pace and track XP on your dashboard."
        )

    if _match_any(text, ["sign up", "signup", "register", "create account", "join"]):
        return "Create a free account at signup.html, then verify your email. After that you can enroll in up to 3 courses."

    if _match_any(text, ["log in", "login", "sign in"]):
        return "Go to login.html. If you're an admin, use your admin credentials — you'll be taken to the admin dashboard automatically."

    if _match_any(text, ["admin", "lms", "dashboard admin"]) and role == "admin":
        return (
            "Your admin dashboard is at lms.html. From there you can manage students, teachers, courses, "
            "enrollments, certificates, and system activity (visits & watch history)."
        )

    if _match_any(text, ["admin", "administrator"]) and role != "admin":
        return "The admin dashboard is only for platform administrators. If you need account help, ask about courses or your profile."

    if _match_any(text, ["student", "manage user", "system activity", "visits"]) and role == "admin":
        return "In the admin panel, open Students or System activity from the sidebar to view users, page visits, and who is watching which course."

    if _match_any(text, ["profile", "photo", "avatar", "picture"]):
        if role == "admin":
            return "Open profile.html (My account in the admin sidebar). Click the camera icon on your avatar to upload a profile photo."
        if role in ("student", "teacher"):
            return "Go to profile.html to update your name and profile photo. Click the camera icon on your avatar to upload an image."
        return "After you sign up and log in, visit profile.html to manage your account and profile photo."

    if _match_any(text, ["teacher", "instructor"]):
        if role == "teacher":
            return "As a teacher, you can be assigned courses by an admin. Visit profile.html for your account, or browse courses.html to preview the catalog."
        if role == "admin":
            return "Manage teachers at lms.html#teachers — add instructors, assign roles, and link them to courses under Manage courses."
        return "Our courses are taught by expert instructors. Sign up as a learner to enroll, or contact the platform admin about teaching."

    for entry in FAQ_ENTRIES:
        if _match_any(text, entry["keys"]):
            return entry["answer"]

    if _match_any(text, ["course", "learn", "catalog", "browse", "class"]):
        cat = None
        for c in ("coding", "design", "business", "personal"):
            if c in text:
                cat = c
                break
        courses = _search_courses(cat or "", 5)
        if courses:
            titles = ", ".join(f"**{c.title}** ({c.category})" for c in courses)
            return f"Here are some courses you might like: {titles}. Open courses.html to explore and enroll."
        return "Browse all courses at courses.html. Every course is free once you're signed in and verified."

    if _match_any(text, ["resume", "continue", "where left", "last lesson"]):
        if role in ("student", "teacher", "admin"):
            return "Open dashboard.html — the Continue learning card takes you back to your last lesson. Or check My Courses for each enrollment."
        return "After you enroll, your dashboard saves your place automatically. Sign up first, then start from dashboard.html."

    if _match_any(text, ["dashboard", "my courses", "home page"]):
        if role == "admin":
            return "Admins use lms.html as the main hub. Learners use dashboard.html and my-courses.html for their progress."
        if role != "guest":
            return "Your dashboard is at dashboard.html. Active enrollments are listed on my-courses.html."
        return "After login, dashboard.html shows your progress, XP, and continue-learning shortcuts."

    if _match_any(text, ["help", "support", "faq", "stuck"]):
        return "Check faq.html for common questions, or ask me directly. I can help with signup, courses, XP, certificates, and navigation."

    # Course title search
    for course in _course_list(25):
        slug_part = course.slug.replace("-", " ")
        if course.slug in text or slug_part in text or course.title.lower() in text:
            return (
                f"**{course.title}** is in {course.category}. "
                f"{course.description[:180]}… "
                f"Preview at course-preview.html?id={course.slug}"
                + (
                    f" or enroll from courses.html."
                    if role != "guest"
                    else " — sign up free to enroll."
                )
            )

    return None


def sharshabeel_reply(message, user=None, page_path="", history=None, request=None):
    message = (message or "").strip()
    if not message:
        return _greeting(user), _suggestions_for_role(_user_role(user))

    ai = _try_openai(message, user, page_path, history)
    if ai:
        return ai, _suggestions_for_role(_user_role(user))

    reply = _rule_reply(message, user, page_path)
    if reply:
        return reply, _suggestions_for_role(_user_role(user))

    role = _user_role(user)
    fallback = (
        f"I'm not sure about that yet, but I can help with courses, signup, XP, certificates, and navigation. "
        f"Try one of the suggestions below, or visit faq.html for more."
    )
    if role == "admin":
        fallback = (
            "I can help with the admin dashboard, users, courses, enrollments, and system activity. "
            "Try asking about students, teachers, or visits."
        )
    return fallback, _suggestions_for_role(role)
