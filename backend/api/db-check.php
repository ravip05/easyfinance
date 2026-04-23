<?php
$host = gethostbyname('aws-0-ap-south-1.pooler.supabase.com');
$user = 'postgres.fskntpivmttjpsomqgqj';
$pass = 'Veda@54321';
$db   = 'postgres';
$port = '5432';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$db";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "SUCCESS: Database connection verified via IPv4 Bridge!";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
