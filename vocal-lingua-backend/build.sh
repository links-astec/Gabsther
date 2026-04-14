#!/bin/bash
# Gabsther Backend — Production Build & Deploy Script
# Installs dependencies, runs migrations, collects static files

set -e

echo "🚀 Starting Gabsther backend production build..."
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput
echo "✓ Migrations applied"
echo ""

# Collect static files for WhiteNoise
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput --clear
echo "✓ Static files collected"
echo ""

# Verify configuration
echo "🔍 Running system checks..."
python manage.py check
echo "✓ System checks passed"
echo ""

echo "✅ Production build complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps:"
echo ""
echo "1. For local testing with gunicorn:"
echo "   gunicorn vocallingua.wsgi:application --bind 0.0.0.0:8000"
echo ""
echo "2. For Render/Heroku deployment:"
echo "   - Push to GitHub"
echo "   - Render/Heroku will automatically run this script"
echo "   - Your backend will be live at https://your-app.onrender.com"
echo ""
echo "3. Monitor health check:"
echo "   curl https://your-app.onrender.com/health/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
