<?php
use Illuminate\Support\Facades\Route;

// SPA catch-all: serve React index.html for all non-API routes
// Allows React Router to handle /dashboard, /leads, /pipeline etc.
Route::get('/{any?}', function () {
    $f = public_path('index.html');
    if (file_exists($f)) return response()->file($f);
    return abort(404);
})->where('any', '.*');