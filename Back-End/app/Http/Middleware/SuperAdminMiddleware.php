<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // If no user is logged in
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login first.'
            ], 401);
        }

        // Check if user role is super_admin
        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Super Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
