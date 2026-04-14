#!/usr/bin/env bash
set -e

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Seeding lessons..."
python manage.py seed_lessons

echo "==> Starting gunicorn..."
exec gunicorn vocallingua.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 2 \
  --log-file -
