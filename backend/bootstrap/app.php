// Suppress PHP 8.5 deprecation warnings (especially for PDO constants)
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

$app = Application::configure(basePath: dirname(__DIR__))

    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();

/*
|--------------------------------------------------------------------------
| Vercel Compatibility
|--------------------------------------------------------------------------
| On Vercel, the filesystem is read-only. We must point the storage
| and cache paths to the /tmp directory.
*/
if (isset($_SERVER['VERCEL_URL'])) {
    $app->useStoragePath('/tmp/storage');
}

return $app;