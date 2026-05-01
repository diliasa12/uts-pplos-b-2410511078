<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GatewayOnly
{
  public function handle(Request $request, Closure $next): Response
  {
    $secret = $request->header('X-Gateway-Secret');

    if (!$secret || $secret !== env('GATEWAY_SECRET')) {
      return response()->json([
        'success' => false,
        'message' => 'Direct access not allowed',
      ], 403);
    }

    return $next($request);
  }
}
