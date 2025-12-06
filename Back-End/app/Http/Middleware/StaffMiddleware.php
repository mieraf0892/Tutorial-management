<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StaffMiddleware
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

        // If user role is not staff
        if ($user->role !== 'staff') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Staff access required.'
            ], 403);
        }

        return $next($request);
    }
}
