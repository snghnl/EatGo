#!/bin/bash

# Exit on any error
set -e

echo "Starting EatGo Backend..."

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Load initial data fixtures (only if not already loaded)
echo "Loading initial data fixtures..."
python manage.py shell -c "
from districts.models import Province
if not Province.objects.exists():
    print('Loading initial data fixtures...')
    import subprocess
    subprocess.run(['python', 'manage.py', 'loaddata', 'fixtures/complete_initial_data.json'], check=True)
    print('Initial data loaded successfully')
else:
    print('Initial data already exists, skipping fixture loading')
" || echo "Warning: Could not load initial data fixtures"

# Create superuser if it doesn't exist (useful for first deployment)
echo "Checking for admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@eatgo.com',
        password='admin123',
        login_method='email'
    )
    print('Created admin user: admin/admin123')
else:
    print('Admin user already exists')
" || echo "Warning: Could not create admin user"

echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 3 --timeout 120 eatgo.wsgi:application
