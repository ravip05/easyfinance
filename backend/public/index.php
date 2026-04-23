<?php
/*
|--------------------------------------------------------------------------
| Vercel connectivity and filesystem patches (TOP LEVEL)
|--------------------------------------------------------------------------
*/
if (isset($_SERVER['VERCEL_URL'])) {
    $dbHost = getenv('DB_HOST');
    if ($dbHost && !filter_var($dbHost, FILTER_VALIDATE_IP)) {
        $ips = gethostbynamel($dbHost);
        if ($ips && isset($ips[0])) putenv("DB_HOST={$ips[0]}");
    }
    putenv('APP_SERVICES_CACHE=/tmp/services.php');
    putenv('APP_PACKAGES_CACHE=/tmp/packages.php');
    putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
    
    // Ensure writable storage directories exist in /tmp
    try {
        $dirs = ['/tmp/storage/framework/views', '/tmp/storage/framework/cache/data', '/tmp/storage/framework/sessions', '/tmp/storage/logs'];
        foreach ($dirs as $dir) {
            if (!is_dir($dir)) @mkdir($dir, 0777, true);
        }
    } catch (\Throwable $e) {}
}

// Suppress PHP 8.5 deprecation warnings for production
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);


use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
define('LARAVEL_START', microtime(true));
if (file_exists($m = __DIR__.'/../storage/framework/maintenance.php')) require $m;
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$response = $kernel->handle($request = Request::capture())->send();
$kernel->terminate($request, $response);