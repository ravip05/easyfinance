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

// Forward Vercel requests to the public index
require __DIR__ . '/../public/index.php';
