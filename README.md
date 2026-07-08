# Barwaaqo Skills

Online learning platform for Somalia and the diaspora — navy + yellow ed-tech design.

## Live links

| | URL |
|---|---|
| **Website** | https://Nawal-Mohamed18.github.io/barwaaqo-skills/ |
| **GitHub** | https://github.com/Nawal-Mohamed18/barwaaqo-skills |
| **API** | https://barwaaqo-skills-api.onrender.com/api/health/ |

## Stack

- **Frontend:** Static HTML, CSS, JavaScript (GitHub Pages)
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

### GitHub Pages (frontend)

Pushes to `main` auto-deploy via `.github/workflows/pages.yml`.  
Enable in repo **Settings → Pages → Source: GitHub Actions**.

### Render (API)

1. Sign in at [render.com](https://render.com)
2. **New → Blueprint** and connect this repo
3. Set environment variables after deploy:
   - `CORS_ORIGINS` = `https://Nawal-Mohamed18.github.io`
   - `FRONTEND_URL` = `https://Nawal-Mohamed18.github.io/barwaaqo-skills/`

See [DOCUMENTATION.md](DOCUMENTATION.md) for full technical docs.

## License

MIT — free for learners.
