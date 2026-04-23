<?php

use Illuminate\Foundation\Application;

/*
|--------------------------------------------------------------------------
| Vercel-Aware Application Core
|--------------------------------------------------------------------------
| This class definitively overrides the bootstrap path to point to /tmp
| at the earliest possible moment, bypassing the Read-Only 500 errors.
*/

class VercelApplication extends Application
{
    public function bootstrapPath($path = '')
    {
        $base = isset($_SERVER['VERCEL_URL']) ? '/tmp/storage/bootstrap' : parent::bootstrapPath();
        return $this->joinPaths($base, $path);
    }

    public function storagePath($path = '')
    {
        $base = isset($_SERVER['VERCEL_URL']) ? '/tmp/storage' : parent::storagePath();
        return $this->joinPaths($base, $path);
    }
}

return VercelApplication::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Illuminate\Foundation\Configuration\Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Illuminate\Foundation\Configuration\Exceptions $exceptions) {
        //
    })
    ->create();
