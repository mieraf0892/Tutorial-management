<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated and is a student
        if ($request->user() && $request->user()->role === 'student') {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Student access required.'
        ], 403);
    }
}