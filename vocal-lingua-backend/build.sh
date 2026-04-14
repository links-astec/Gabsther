#!/bin/bash
# Gabsther Backend — Build & Deploy Script
# Installs dependencies, runs migrations, collects static files

set -e

echo "🚀 Starting Gabsther backend build..."

# Install Python dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️  Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed (interactive, only in local dev)
# Uncomment to enable:
# echo "👤 Creating superuser (optional)..."
# python manage.py createsuperuser

echo "✅ Build complete!"
echo ""
echo "To start the development server, run:"
echo "  python manage.py runserver"
echo ""
echo "To start with gunicorn for production testing:"
echo "  gunicorn vocallingua.wsgi:application --bind 0.0.0.0:8000"
