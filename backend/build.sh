#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing composer dependencies..."
composer install --no-dev --optimize-autoloader

echo "Clearing caches..."
php artisan optimize:clear

echo "Caching config & routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Running migrations with force flag..."
php artisan migrate:fresh --force --seed
