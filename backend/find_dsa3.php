<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::where('name', 'like', '%dsa-3%')->get();
foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Role: {$u->role} | Status: {$u->status} | Franchise: {$u->franchise_id}\n";
}
