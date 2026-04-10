# VocalLingua 🇫🇷

A mobile-first French language learning platform with AI-powered speaking practice.

---

## Project Structure

```
french_site/
├── vocal-lingua-backend/     Django 5 + DRF + JWT
└── vocal-lingua-frontend/    Next.js 15 + TypeScript + Tailwind
```

---

## Quick Start — Two Terminals

### Terminal 1 — Django Backend

```bash
cd vocal-lingua-backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY

# 4. Run migrations
python manage.py migrate

# 5. Create admin superuser
python manage.py createsuperuser

# 6. Seed 21 French lessons + languages
python manage.py seed_lessons

# 7. Start the server (port 8000)
python manage.py runserver
```

Backend runs at: http://localhost:8000
Admin panel:     http://localhost:8000/admin

---

### Terminal 2 — Next.js Frontend

```bash
cd vocal-lingua-frontend

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local — NEXT_PUBLIC_API_URL should be http://localhost:8000/api

# 3. Start the dev server (port 3000)
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (required) | Django secret key — generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `True` | Set to `False` in production |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `DATABASE_URL` | SQLite | PostgreSQL: `postgresql://user:pass@localhost:5432/vocallingua` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Frontend origin(s) |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `60` | Access token lifetime |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `30` | Refresh token lifetime |
| `OPENAI_API_KEY` | (optional) | Required for AI voice chat; leave empty to use mock responses |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Django API base URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | This app's URL |

---

## API Endpoints

### Auth (`/api/auth/`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register/` | Register new user |
| POST | `/auth/login/` | Login → access + refresh tokens |
| POST | `/auth/logout/` | Blacklist refresh token |
| POST | `/auth/token/refresh/` | Get new access token |

### Users (`/api/users/`)
| Method | Path | Description |
|--------|------|-------------|
| GET/PATCH | `/users/me/` | Get/update current user |
| GET/PATCH | `/users/profile/` | Get/update user profile |
| POST | `/users/onboarding/` | Complete onboarding (language/level/interests) |
| GET/POST | `/users/streak/` | Get streak / record activity |
| GET | `/users/heatmap/` | Activity heatmap data |

### Lessons (`/api/lessons/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/lessons/languages/` | List available languages |
| GET | `/lessons/` | List lessons (supports `?language=fr&category=greetings&difficulty=A1`) |
| GET | `/lessons/{id}/` | Lesson detail with full content |
| POST | `/lessons/{id}/complete/` | Mark lesson complete, award XP |
| GET | `/lessons/progress/` | User's progress on all lessons |
| GET | `/lessons/stats/` | Aggregated stats for profile |

### Voice (`/api/voice/`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/voice/chat/` | Proxy message to OpenAI AI tutor |
| GET/POST | `/voice/sessions/` | List / save voice sessions |
| GET | `/voice/sessions/{id}/` | Single session detail |

---

## JWT Authentication

The frontend stores tokens in `localStorage` with keys `vl_access` and `vl_refresh`.

Every API request includes:
```
Authorization: Bearer <access_token>
```

On 401, the client automatically:
1. Calls `/auth/token/refresh/` with the refresh token
2. Retries the original request with the new access token
3. Redirects to `/login` if refresh fails

---

## CORS

Configured in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
CORS_ALLOW_CREDENTIALS = True
```

To add more origins, update `CORS_ALLOWED_ORIGINS` in `.env`.

---

## Seed Data Commands

```bash
# Seed 21 French lessons (skip existing)
python manage.py seed_lessons

# Reset and re-seed all French lessons
python manage.py seed_lessons --reset
```

Seeded content includes:
- **5 Languages** (French active, 4 others as placeholders)
- **21 French lessons** across 5 categories:
  - 👋 Greetings & Introductions (5 lessons, A1)
  - 🍽️ Food & Drink (4 lessons, A1-A2)
  - ✈️ Travel (4 lessons, A2-B1)
  - 📝 Grammar Basics (4 lessons, A1-B1)
  - 🎭 Role-play Scenarios (4 lessons, B1-B2)

---

## Voice Chat Setup

### Without OpenAI key
The app works without an OpenAI key. The backend returns mock AI responses so you can test the full flow. Set `OPENAI_API_KEY=` (empty) in `.env`.

### With OpenAI key
1. Get a key from https://platform.openai.com
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. The `/api/voice/chat/` endpoint proxies requests to GPT-4o-mini

### Browser Speech APIs
- **Chrome/Edge**: Full support for SpeechRecognition + SpeechSynthesis
- **Safari**: Supported (webkit prefix handled)
- **Firefox**: SpeechSynthesis only — no recognition

---

## PWA (Progressive Web App)

The app is installable on mobile devices:
- `public/manifest.json` — app manifest
- `public/sw.js` — service worker for offline caching
- Lessons are cached after first view
- Offline banner shows when network is unavailable

---

## Adding New Languages

1. Add a row in the admin panel: `/admin/lessons/language/`
2. Create lessons for the language via admin or a new seed command
3. Set `is_active=True` to show in the onboarding language picker
4. Set `tts_locale` to the correct BCP-47 code (e.g., `es-ES` for Spanish)

---

## Production Deployment

### Backend
```bash
DEBUG=False
DATABASE_URL=postgresql://...
ALLOWED_HOSTS=yourdomain.com
SECRET_KEY=<strong-random-key>

pip install gunicorn
gunicorn vocallingua.wsgi:application --bind 0.0.0.0:8000
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
npm run build
npm start
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | Django 5 + Django REST Framework |
| Authentication | djangorestframework-simplejwt |
| CORS | django-cors-headers |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI proxy | OpenAI GPT-4o-mini |
| Frontend framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | lucide-react |
| Voice (STT) | Browser Web Speech API |
| Voice (TTS) | Browser SpeechSynthesis API |
| PWA | Custom service worker |
| Theme | next-themes (dark/light) |
