FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql gd zip

# Fix Apache MPM: Ensure only prefork is loaded to avoid AH00534
RUN rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf \
    && rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf \
    && a2enmod mpm_prefork

# Enable Apache mod_rewrite and set ServerName
RUN a2enmod rewrite && echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Monorepo support: If built from root, move backend files to /var/www/html
RUN if [ -f "backend/composer.json" ]; then \
    cp -r backend/. /var/www/html/ && \
    rm -rf /var/www/html/backend; \
    fi

# Set Permissions
RUN mkdir -p /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/logs \
    /var/www/html/bootstrap/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Change Apache document root to public folder
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Build dependencies
RUN composer update --no-dev --optimize-autoloader

# Run deployment script
RUN chmod +x build.sh

# EXPOSE port (Railway will use its own, but we keep 80 as default)
EXPOSE 80

# Overwrite entrypoint to run migrations before starting Apache
# Fix MPM at runtime, set the dynamic Railway port, and run migrations before starting Apache
CMD bash -c "a2dismod mpm_event mpm_worker || true && a2enmod mpm_prefork || true && sed -i \"s/Listen 80/Listen ${PORT:-80}/g\" /etc/apache2/ports.conf && sed -i \"s/<VirtualHost \*:80>/<VirtualHost *:${PORT:-80}>/g\" /etc/apache2/sites-available/*.conf && ./build.sh && apache2-foreground"
