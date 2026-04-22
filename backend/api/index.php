<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

