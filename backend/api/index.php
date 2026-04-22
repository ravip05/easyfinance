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
| Vercel IPv4 Connectivity Patch
|--------------------------------------------------------------------------
| Supabase hostnames resolve to both IPv4 and IPv6. Vercel often fails 
| to assign a socket for IPv6. We manually resolve to IPv4 here.
*/
$dbHost = getenv('DB_HOST');
if ($dbHost && !filter_var($dbHost, FILTER_VALIDATE_IP)) {
    $ips = gethostbynamel($dbHost);
    if ($ips && isset($ips[0])) {
        putenv("DB_HOST={$ips[0]}"); // Force the first IPv4 address
    }
}

// Forward Vercel requests to the public index
require __DIR__ . '/../public/index.php';
