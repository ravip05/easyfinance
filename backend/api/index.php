<?php

use Illuminate\Http\Request;

// 1. Restore Factory Vercel Entry Point
require __DIR__ . '/../vendor/autoload.php';

// 2. Bootstrap with Storage Override
$app = require_once __DIR__ . '/../bootstrap/app.php';

if (isset($_SERVER['VERCEL_URL'])) {
    $app->useStoragePath('/tmp/storage');
}

// 3. Handle Request
$app->handleRequest(Request::capture());
