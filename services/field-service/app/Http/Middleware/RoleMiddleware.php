<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $authUser = $request->auth_user;

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        if (!in_array($authUser['role'], $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}
