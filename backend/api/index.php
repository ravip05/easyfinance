<?php

use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

/*
|--------------------------------------------------------------------------
| Vercel Monolithic God-Bridge
|--------------------------------------------------------------------------
| This script handles EVERYTHING: directory creation, path overrides,
| and the full Laravel bootstrap. This is the ultimate baseline for Vercel.
*/

// 1. Atomic Storage and Bootstrap Initialization
if (isset($_SERVER['VERCEL_URL'])) {
    $storagePaths = [
        '/tmp/storage/framework/views',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/bootstrap',
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
    putenv('LARAVEL_SERVICES_CACHE=/tmp/storage/bootstrap/services.php');
    putenv('LARAVEL_PACKAGES_CACHE=/tmp/storage/bootstrap/packages.php');
}

// 2. Load Autoloader
require __DIR__ . '/../vendor/autoload.php';

// 3. Define Vercel-Aware Application Class In-Place
if (!class_exists('VercelApplication')) {
    class VercelApplication extends Application {
        public function bootstrapPath($path = '') {
            return isset($_SERVER['VERCEL_URL']) 
                ? $this->joinPaths('/tmp/storage/bootstrap', $path)
                : parent::bootstrapPath($path);
        }
        public function storagePath($path = '') {
            return isset($_SERVER['VERCEL_URL']) 
                ? $this->joinPaths('/tmp/storage', $path)
                : parent::storagePath($path);
        }
    }
}

// 4. Instantiate and Configure (Monolithic Builder)
$app = VercelApplication::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();

// 5. Final Path Redirections
if (isset($_SERVER['VERCEL_URL'])) {
    $app->useStoragePath('/tmp/storage');
    $app->useBootstrapPath('/tmp/storage/bootstrap');
}

// 6. Handle Request
$app->handleRequest(Request::capture());
