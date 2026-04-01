<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::where('franchise_id', 3)->get();

foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Code: {$u->emp_code} | Role: {$u->role} | Status: {$u->status}\n";
}
