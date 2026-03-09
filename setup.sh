#!/bin/bash
# =============================================================================
# EasyFinance CRM — One-Command Setup for Hostinger
# Run ONCE after uploading: bash ~/crm/setup.sh
# =============================================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║    EasyFinance CRM — Server Setup 🚀     ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

cd "$DIR"

echo -e "${YELLOW}[1/6] Checking PHP 8.1+...${NC}"
PHP_OK=$(php -r "echo version_compare(PHP_VERSION,'8.1.0','>=') ? 'ok' : 'fail';")
if [ "$PHP_OK" != "ok" ]; then
  echo -e "${RED}ERROR: Need PHP 8.1+. Fix: hPanel → PHP Configuration${NC}"
  exit 1
fi
echo -e "${GREEN}✓ PHP $(php -r 'echo PHP_VERSION;')${NC}"

echo -e "${YELLOW}[2/6] Installing Composer dependencies...${NC}"
if command -v composer &>/dev/null; then
  composer install --no-dev --optimize-autoloader --no-interaction --quiet
else
  php -r "copy('https://getcomposer.org/installer','composer-setup.php');"
  php composer-setup.php --quiet && php -r "unlink('composer-setup.php');"
  php composer.phar install --no-dev --optimize-autoloader --no-interaction --quiet
fi
echo -e "${GREEN}✓ PHP packages installed${NC}"

echo -e "${YELLOW}[3/6] Checking .env...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${RED}ERROR: .env not found. Run: cp .env.example .env && nano .env${NC}"
  exit 1
fi
if grep -q "^APP_KEY=$" .env; then
  php artisan key:generate --force
  echo -e "${GREEN}✓ APP_KEY generated${NC}"
else
  echo -e "${GREEN}✓ APP_KEY present${NC}"
fi

echo -e "${YELLOW}[4/6] Setting storage permissions...${NC}"
chmod -R 775 storage bootstrap/cache
php artisan storage:link --force 2>/dev/null || true
echo -e "${GREEN}✓ Permissions OK${NC}"

echo -e "${YELLOW}[5/6] Running database migrations and seeding demo data...${NC}"
php artisan migrate --force
php artisan db:seed --force
echo -e "${GREEN}✓ Database ready${NC}"

echo -e "${YELLOW}[6/6] Caching config and routes...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✓ Optimized${NC}"

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Test: curl https://yourdomain.com/api/health"
echo ""
echo "Login:"
echo "  admin@easyfinancewale.in  / admin123"
echo "  priya@easyfinancewale.in  / mgr123"
echo "  amit@easyfinancewale.in   / staff123"
echo "  mumbaidsa@easyfinancewale.in / dsa123"
