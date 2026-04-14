# Gabsther Backend — Production Setup Guide

## Environment Variables

Copy `.env.example` to `.env` and fill in your production values:

```bash
cp .env.example .env
```

### Required Values

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Random 50+ char string | Run: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` | NEVER use `True` in production |
| `ALLOWED_HOSTS` | `gabsther-api.onrender.com` | Add your domain(s) |
| `DATABASE_URL` | PostgreSQL connection string | Render provides this automatically |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-domain.vercel.app` | Your Vercel frontend URL |
| `GROQ_API_KEY` | Your Groq API key | Get free from [console.groq.com](https://console.groq.com/keys) |

## Deployment to Render

1. **Create account** at [render.com](https://render.com)
2. **Connect GitHub** repository
3. **Create Web Service**:
   - Branch: `main`
   - Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start command: `gunicorn vocallingua.wsgi:application --bind 0.0.0.0:$PORT --workers 2`
4. **Add environment variables** from `.env.example`
5. **Create PostgreSQL database**:
   - Name: `gabsther-db`
   - PostgreSQL 15
   - Free tier is fine for development

Render will automatically run migrations via the `Procfile` release hook.

## Deployment to Heroku (Alternative)

```bash
heroku login
heroku create gabsther-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run python manage.py migrate
```

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start dev server
python manage.py runserver

# Or with gunicorn (production simulation)
gunicorn vocallingua.wsgi:application --bind 0.0.0.0:8000
```

## Health Check

The `/health/` endpoint is available at:
```
https://your-backend-url.onrender.com/health/
```

Use this URL in [UptimeRobot](https://uptimerobot.com) to monitor uptime.

## Static Files

Collected with `python manage.py collectstatic` during the build. WhiteNoise serves them directly from the app in production (no separate CDN needed, though you can use S3 for media files).

## Database Migrations

On Render, migrations run automatically via the `release` hook in `Procfile`. Locally, run:
```bash
python manage.py migrate
```

## Security Checklist

- [x] `DEBUG=False` in production
- [x] `SECRET_KEY` is random and long
- [x] `ALLOWED_HOSTS` includes only your domain(s)
- [x] `CORS_ALLOWED_ORIGINS` restricted to your frontend
- [x] Database password is secure
- [x] API keys (.env file) are NOT committed to git
- [x] HTTPS enforced (Render/Heroku do this by default)
- [x] Health check endpoint ready for monitoring

## Troubleshooting

**502 Bad Gateway**
- Check `heroku logs` or Render's logs
- Ensure `gunicorn` is installed: `pip install -r requirements.txt`
- Verify `Procfile` is correct

**Database connection error**
- Verify `DATABASE_URL` env var is set
- Run migrations: `heroku run python manage.py migrate`

**Static files not loading**
- Run collectstatic: `python manage.py collectstatic --noinput`
- Check `STATIC_ROOT` and `STATIC_URL` in settings

**CORS errors from frontend**
- Add frontend URL to `CORS_ALLOWED_ORIGINS`
- Must include `https://` scheme
