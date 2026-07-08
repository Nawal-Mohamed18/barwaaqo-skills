# Barwaaqo Skills — Technical Documentation

**Version:** 2026.07  
**Stack:** Static HTML/CSS/JS + Django REST API + SQLite (dev)  
**Product:** All-free LMS for Somalia and diaspora learners  
**Theme:** Navy + Yellow

---

## 1. Architecture

```
Frontend (static, port 8080)
  HTML pages + js/lib/* modules
        │
        │  JWT Bearer + JSON REST
        ▼
Backend (Django 5, port 8765)
  accounts │ courses │ learning │ payments*
```

\* Payments app exists for future use; all courses are currently free.

### Django apps

| App | Responsibility |
|-----|----------------|
| `accounts` | Users, JWT auth, email verification, avatars |
| `courses` | Catalog, lessons, roadmap phases |
| `learning` | Enrollments, progress, quizzes, certificates, gamification |
| `payments` | Stripe scaffold (dormant) |

### Frontend modules (`js/lib/`)

| Module | Role |
|--------|------|
| `config.js` | API base URL (default `8765`) |
| `api.js` | HTTP client, JWT storage |
| `auth.js` | Login, signup, session |
| `auth-guard.js` | Page protection (`guest` / `verified` / `admin`) |
| `progress.js` | Learner state sync |
| `navigation.js` | URL helpers, nav zones |
| `courses-loader.js` | API catalog + `courses.js` fallback |
| `app-shell.js` | Shared sidebar |

---

## 2. Pages

| Page | Access | Purpose |
|------|--------|---------|
| `index.html` | Public | Marketing homepage (live stats) |
| `login.html` / `signup.html` | Guest | Auth |
| `verify-email.html` | Guest | Email verification |
| `courses.html` | Verified | Catalog + filters |
| `course-preview.html` | Guest | Course marketing preview |
| `course-learn.html` | Verified | Course hub (explicit enroll) |
| `course.html` | Verified | Video player + quiz |
| `dashboard.html` | Verified | Resume, stats, activity heatmap |
| `my-courses.html` | Verified | Enrollments + leave course |
| `profile.html` | Verified | Profile, stats, certificates |
| `certificate.html` | Public | Certificate view / verify |
| `lms.html` | Admin | **Admin dashboard** |
| `faq.html` | Public | FAQ |

---

## 3. Learning flow

```
Preview course (guest)
    ↓
Sign up + verify email
    ↓
Browse courses → Enroll (explicit, max 3 active)
    ↓
course-learn.html (hub) → course.html (player)
    ↓
Watch lessons → auto-complete at ~85% or video end
    ↓
All lessons done → Final quiz (70% pass)
    ↓
Enrollment completed + Certificate issued
```

### Enrollment rules

- **Max 3 active** (non-completed) courses
- **No silent auto-enroll** — opening a lesson does not enroll; user must confirm
- **Leave course** — removes enrollment, completions, watch progress (certificates kept)

---

## 4. Backend services (`learning/services.py`)

| Function | Purpose |
|----------|---------|
| `compute_xp()` | 10 XP/lesson + 100 XP/course |
| `compute_streak()` | Consecutive days with lesson completions |
| `activity_calendar()` | 140-day heatmap data |
| `try_finalize_course()` | Complete enrollment when lessons + quiz done |
| `issue_certificate()` | Idempotent certificate creation |
| `clear_course_progress()` | Full unenroll cleanup |

### State API (`GET /api/learning/state/`)

Returns: `enrolled`, `completed`, `progress`, `last`, `activity`, `certificates`, `stats`

---

## 5. Admin dashboard

**URL:** `lms.html`  
**API:** `GET /api/learning/lms/overview/`  
**Access:** `role=admin` or Django `is_staff`

### Metrics shown

- Courses, verified learners, teachers
- Active / completed enrollments
- Lessons completed, certificates issued, quiz passes
- Top courses table
- Recent enrollments
- Recent certificates (with verify links)

### Granting admin access

```bash
cd backend
py manage.py createsuperuser
# or set User.role = 'admin' in Django admin
```

---

## 6. Certificate system

1. User completes all lessons + passes quiz
2. `try_finalize_course()` sets `enrollment.completed_at`
3. `issue_certificate()` creates `Certificate` (UUID, unique per user+course)
4. Certificate appears in profile + `/learning/state/`
5. Public verification: `GET /api/learning/certificates/verify/:uuid/`
6. View page: `certificate.html?id={uuid}`

---

## 7. Development

### Backend

```bash
cd backend
py -m pip install -r requirements.txt
py manage.py migrate
py manage.py seed_courses
py manage.py runserver 8765
```

### Frontend

```bash
py -m http.server 8080
```

Open `http://localhost:8080`

### Environment

Copy `backend/.env.example` → `backend/.env`

Key variables: `DJANGO_SECRET_KEY`, `FRONTEND_URL`, `CORS_ORIGINS`

---

## 8. Security notes (production checklist)

- [ ] Set strong `SECRET_KEY` via environment
- [ ] `DEBUG=False` in production
- [ ] Lock down `CORS_ORIGINS`
- [ ] Serve media (avatars) via CDN/nginx
- [ ] Use PostgreSQL instead of SQLite
- [ ] Add rate limiting on auth endpoints
- [ ] Remove `verify_url` from signup API responses
- [ ] Consider httpOnly cookies vs localStorage JWT

---

## 9. Known decisions

| Decision | Rationale |
|----------|-----------|
| All courses free | Product direction for Somalia/diaspora access |
| Hub + player split | Hub for overview; player for focused learning |
| 3-course limit | Encourages completion, reduces overload |
| Frontend-authored catalog | `js/data/courses.js` seeds backend |
| Payments kept in backend | Future premium without rewrite |

---

## 10. Roadmap (not yet built)

- Password reset
- JWT refresh flow in frontend
- Teacher dashboard UI
- XP levels / achievements UI
- Course recommendations
- PostgreSQL + production deployment guide
- PDF certificate export
- Rate limiting middleware

---

## 11. File index

| Area | Path |
|------|------|
| Settings | `backend/config/settings.py` |
| Learning logic | `backend/learning/views.py`, `services.py` |
| Admin API | `backend/learning/lms_views.py` |
| Progress client | `js/lib/progress.js` |
| Admin UI | `lms.html`, `js/lms-hub.js` |
| Course data | `js/data/courses.js` |
| Certificates | `certificate.html`, `js/certificate.js` |
