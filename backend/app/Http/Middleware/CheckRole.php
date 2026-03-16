<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// role based access control middleware for the five tier system
// usage in routes: ->middleware('role:admin,manager')
// rejects requests from users whose role is not in the allowed list

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Required role: ' . implode(' or ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
