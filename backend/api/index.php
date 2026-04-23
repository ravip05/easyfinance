<?php

use Illuminate\Http\Request;

// 1. Atomic Storage Initialization for Vercel
if (isset($_SERVER['VERCEL_URL'])) {
    $storagePaths = [
        '/tmp/storage/framework/views',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/app/public',
        '/tmp/storage/logs',
    ];
    foreach ($storagePaths as $path) {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
    }
    
    putenv('APP_ENV=production');
    putenv('APP_DEBUG=true'); 
    putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
    $_ENV['APP_ENV'] = 'production';
    $_ENV['APP_DEBUG'] = 'true';
}

// 2. Factory Entry Point
require __DIR__ . '/../vendor/autoload.php';

// 3. Bootstrap with Global Storage Override
$app = require_once __DIR__ . '/../bootstrap/app.php';

if (isset($_SERVER['VERCEL_URL'])) {
    $app->useStoragePath('/tmp/storage');
}

// 4. Handle Request
$app->handleRequest(Request::capture());
