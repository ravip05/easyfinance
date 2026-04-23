<?php
use Illuminate\Support\Str;
return [
    'default' => env('CACHE_DRIVER', 'file'),
    'stores' => [
        'file'  => ['driver' => 'file', 'path' => (isset($_SERVER['VERCEL_URL'])) ? '/tmp/storage/framework/cache/data' : storage_path('framework/cache/data'), 'lock_path' => (isset($_SERVER['VERCEL_URL'])) ? '/tmp/storage/framework/cache/data' : storage_path('framework/cache/data')],
        'array' => ['driver' => 'array', 'serialize' => false],
        'null'  => ['driver' => 'null'],
        'redis' => ['driver' => 'redis', 'connection' => 'cache', 'lock_connection' => 'default'],
    ],
    'prefix' => env('CACHE_PREFIX', Str::slug(env('APP_NAME','laravel'),'_').'_cache_'),
];
