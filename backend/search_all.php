<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::where('name', 'like', '%dsa-3%')
    ->orWhere('email', 'like', '%dsa-3%')
    ->orWhere('emp_code', 'like', '%dsa-3%')
    ->get();

foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Code: {$u->emp_code} | Role: {$u->role} | Status: {$u->status} | Franchise: {$u->franchise_id}\n";
}
