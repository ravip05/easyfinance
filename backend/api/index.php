<?php

use Illuminate\Http\Request;

// 1. Hardcore Vercel Environment Setup
if (isset($_SERVER['VERCEL_URL'])) {
    putenv('APP_ENV=production');
    putenv('APP_DEBUG=false');
    putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
    putenv('APP_SERVICES_CACHE=/tmp/services.php');
    putenv('APP_PACKAGES_CACHE=/tmp/packages.php');
    $_ENV['APP_ENV'] = 'production';
    $_ENV['APP_DEBUG'] = 'false';
}

require __DIR__ . '/../vendor/autoload.php';

// 2. Bootstrap with Storage Override
$app = require_once __DIR__ . '/../bootstrap/app.php';

if (isset($_SERVER['VERCEL_URL'])) {
    $app->useStoragePath('/tmp/storage');
}

// 3. Handle Request
$app->handleRequest(Request::capture());
