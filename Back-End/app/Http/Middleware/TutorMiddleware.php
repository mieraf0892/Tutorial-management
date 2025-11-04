<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TutorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role === 'tutor') {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Tutor access required.'
        ], 403);
    }
}