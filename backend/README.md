# Barwaaqo Skills — Django API

REST backend for auth, courses, enrollments, progress, quizzes, and certificates.

## Setup

```bash
cd backend
py -m pip install -r requirements.txt
py manage.py migrate
py manage.py seed_courses
py manage.py createsuperuser   # optional — Django admin + platform admin role
py manage.py runserver 8765
```

API runs at **http://127.0.0.1:8765/api/**

## Frontend

Serve the static site separately (port 8080):

```bash
cd ..
py -m http.server 8080
```

Open **http://localhost:8080/index.html**

## Standard ports

| Service | Port |
|---------|------|
| Django API | **8765** |
| Static frontend | **8080** |

Override API URL in browser: `localStorage.setItem('barwaaqo_api_base', 'http://127.0.0.1:8765/api')`

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

Set user `role=admin` or `is_staff=True` in Django admin, then open **lms.html** in the frontend.

## Dev notes

- Verification emails print to the Django terminal.
- JWT stored in `localStorage` as `barwaaqo_access_token`.
- Copy `.env.example` to `.env` for `FRONTEND_URL`, `CORS_ORIGINS`, etc.

## Re-seed courses

```bash
py build_seed.py
py manage.py seed_courses
```
