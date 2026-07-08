# Barwaaqo Skills — Django API

REST backend for auth, courses, enrollments, progress, quizzes, and certificates.

## Live API

**Base URL:** https://barwaaqo-skills-api.onrender.com/api/

**Health check:** https://barwaaqo-skills-api.onrender.com/api/health/

## Frontend

**Live site:** https://nawal-mohamed18.github.io/barwaaqo-skills/

## Core API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup/` | — | Create account |
| POST | `/api/auth/login/` | — | Login → JWT |
| GET/PATCH | `/api/auth/me/` | JWT | Profile |
| GET | `/api/courses/` | — | Catalog |
| GET | `/api/courses/stats/` | — | Live platform stats |
| GET | `/api/learning/state/` | JWT | Full learner state |
| GET | `/api/learning/lms/overview/` | JWT | Admin / teacher / student workspace |
| POST | `/api/learning/enroll/` | JWT | Enroll (max 3 active) |
| DELETE | `/api/learning/enroll/:slug/` | JWT | Leave course + wipe progress |
| POST | `/api/learning/last/` | JWT | Save resume position |
| POST | `/api/learning/watch/` | JWT | Save watch seconds |
| POST | `/api/learning/lesson-complete/` | JWT | Mark lesson complete |
| GET/POST | `/api/learning/quiz/:slug/` | JWT | Course quiz |
| GET | `/api/learning/certificates/` | JWT | User certificates |
| GET | `/api/learning/certificates/verify/:uuid/` | — | Public verification |

## Product model

**All courses are free** for verified learners. Enrollment is limited to 3 active (non-completed) courses.

## Admin access

Set user `role=admin` or `is_staff=True` in Django admin, then open **lms.html** on the live site.

## Environment

Copy `.env.example` to `.env` and set `DJANGO_SECRET_KEY`, `FRONTEND_URL`, `CORS_ORIGINS`, etc.

## Re-seed courses

```bash
py build_seed.py
py manage.py seed_courses
```
