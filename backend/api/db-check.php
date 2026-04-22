<?php
// Standalone DB Connection Probe
$host = "db.jggrwpctzxmlmolhfgun.supabase.co";
$port = "5432";
$dbname = "postgres";
$user = "postgres";
$password = "u7.vyxeZ!Bks/2M";

echo "<h1>Supabase Connection Probe</h1>";
echo "Testing connection to <b>$host:$port</b>...<br>";

$conn_string = "host=$host port=$port dbname=$dbname user=$user password=$password sslmode=require connect_timeout=5";
$dbconn = @pg_connect($conn_string);

if($dbconn) {
    echo "<h2 style='color:green;'>SUCCESS!</h2>";
    echo "Connection established successfully.";
    pg_close($dbconn);
} else {
    echo "<h2 style='color:red;'>FAILED!</h2>";
    echo "Error: " . pg_last_error();
}

echo "<hr>";
echo "<h3>Testing IPv4 IP specifically...</h3>";
$ip = "54.195.101.44";
echo "Testing connection to <b>$ip:5432</b>...<br>";
$conn_string_ip = "host=$ip port=$port dbname=$dbname user=$user password=$password sslmode=require connect_timeout=5";
$dbconn_ip = @pg_connect($conn_string_ip);

if($dbconn_ip) {
    echo "<h2 style='color:green;'>IPv4 SUCCESS!</h2>";
    pg_close($dbconn_ip);
} else {
    echo "<h2 style='color:red;'>IPv4 FAILED!</h2>";
    echo "Error: " . pg_last_error();
}
