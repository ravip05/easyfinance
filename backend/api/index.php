<?php
// Disable error reporting for production to prevent breaking headers
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

if (isset($_GET['debug'])) {
    echo "<h1>Debug Info</h1>";
    echo "PHP Version: " . phpversion() . "<br>";
    echo "Vercel URL: " . ($_SERVER['VERCEL_URL'] ?? 'N/A') . "<br>";
    echo "Environment: " . (getenv('APP_ENV') ?: 'N/A') . "<br>";
    echo "Filesystem writable? " . (is_writable('/tmp') ? 'Yes' : 'No') . "<br>";
    exit;
}

// Redirect service and package caches to /tmp for Vercel
putenv('APP_SERVICES_CACHE=/tmp/services.php');
putenv('APP_PACKAGES_CACHE=/tmp/packages.php');

/*
|--------------------------------------------------------------------------
| URL Normalization for Vercel
|--------------------------------------------------------------------------
| Laravel 11 on Vercel often loses its prefix context. We explicitly 
| tell Laravel to handle /api as the root for API requests.
*/
$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/api') === 0) {
    $_SERVER['REQUEST_URI'] = substr($uri, 4) ?: '/';
}

// Forward Vercel requests to the public index
require __DIR__ . '/../public/index.php';
