<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::where('emp_code', 'dsa-3')
    ->orWhere('email', 'like', '%dsa-3%')
    ->orWhere('name', 'like', '%dsa-3%')
    ->first();

if ($user) {
    echo "ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Role: " . $user->role . "\n";
    echo "Status: " . $user->status . "\n";
    echo "Franchise ID: " . $user->franchise_id . "\n";
    echo "Emp Code: " . $user->emp_code . "\n";
} else {
    echo "User dsa-3 NOT found.\n";
}
