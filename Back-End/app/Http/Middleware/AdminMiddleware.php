<?php
// app/Http/Middleware/AdminMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check if user is authenticated and has admin role
        if (!$user || !$this->isAdmin($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Administrator access required.'
            ], 403);
        }

        return $next($request);
    }

    private function isAdmin($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin', 'user_admin', 'financial_admin']);
    }
}