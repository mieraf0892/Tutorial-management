<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get current authenticated user
     */
    public function current(Request $request)
    {
        $user = $request->user();

        // Load role-specific relations
        if ($user->role === 'student') {
            $user->load('student.learningPreferences', 'student.courseDetails');
        } elseif ($user->role === 'tutor') {
            $user->load('tutor.subjects', 'tutor.availability');
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'role_display' => ucfirst($user->role),
            'phone' => $user->phone,
            'profile' => $user->student ?? $user->tutor ?? null,
        ]);
    }

    /**
     * Debug route for tutor verification
     */
    public function debugTutorCheck(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role,
            'has_tutor_record' => $user->tutor ? true : false,
            'tutor_id' => $user->tutor?->id,
            'tutor_details' => $user->tutor
        ]);
    }
}