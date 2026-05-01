<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->header('X-User-Id');
        $userRole = $request->header('X-User-Role');
        $userEmail = $request->header('X-User-Email');

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->merge([
            'auth_user' => [
                'id' => $userId,
                'role' => $userRole,
                'email' => $userEmail,
            ]
        ]);

        return $next($request);
    }
}
