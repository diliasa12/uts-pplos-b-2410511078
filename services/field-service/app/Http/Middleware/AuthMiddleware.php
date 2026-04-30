<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'success' => false,
                'message' => 'Access token not found',
            ], 401);
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = $this->decodeJwt($token);
            $request->merge(['auth_user' => $decoded]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }

        return $next($request);
    }

    private function decodeJwt(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new \Exception('Invalid token format');
        }

        [$header, $payload, $signature] = $parts;

        $secret = env('JWT_SECRET');
        $expected = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        if (!hash_equals($expected, $signature)) {
            throw new \Exception('Invalid token signature');
        }

        $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);

        if (isset($data['exp']) && $data['exp'] < time()) {
            throw new \Exception('Token has expired');
        }

        return $data;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
