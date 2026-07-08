# Barwaaqo Skills

Online learning platform for Somalia and the diaspora — navy + yellow ed-tech design.

## Live demo

**Website:** https://nawal-mohamed18.github.io/barwaaqo-skills/

**GitHub:** https://github.com/Nawal-Mohamed18/barwaaqo-skills

**API health:** https://barwaaqo-skills-api.onrender.com/api/health/

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Nawal-Mohamed18/barwaaqo-skills)

> Click **Deploy to Render** once (sign in with GitHub if needed) to host the Django API so login and courses work on the live site.

## Stack

- **Frontend:** Static HTML, CSS, JavaScript ([GitHub Pages](https://nawal-mohamed18.github.io/barwaaqo-skills/))
- **Backend:** Django REST API + PostgreSQL (Render free tier)

## Run locally

**Backend** (port 8765):

```bash
cd backend
py -m pip install -r requirements.txt
py manage.py migrate
py manage.py seed_courses
py manage.py runserver 8765
```

**Frontend** (port 8080):

```bash
py -m http.server 8080
```

Open http://localhost:8080

## Deploy

### Website (already live)

Pushes to `main` auto-deploy via GitHub Actions Pages.

Live URL: https://nawal-mohamed18.github.io/barwaaqo-skills/

### API (Render)

Use the **Deploy to Render** button above, or:

1. Open https://render.com/deploy?repo=https://github.com/Nawal-Mohamed18/barwaaqo-skills
2. Sign in with GitHub → **Apply** / **Deploy Blueprint**
3. Wait for `barwaaqo-skills-api` to go live (first build ~5–10 minutes)

CORS and frontend URL are already set in `render.yaml`.

See [DOCUMENTATION.md](DOCUMENTATION.md) for full technical docs.

## License

MIT — free for learners.
