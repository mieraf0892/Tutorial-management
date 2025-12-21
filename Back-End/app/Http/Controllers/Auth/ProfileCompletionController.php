<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfileCompletionController extends Controller
{
    /**
     * Complete student profile (Step 2 for students)
     */
    public function completeStudentProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only students can complete student profile'
            ], 403);
        }

        if (!$user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first'
            ], 403);
        }

        // You can reuse your existing StudentAuthController validation
        // Or create a simplified version here
        
        return response()->json([
            'success' => true,
            'message' => 'Redirect to existing student profile completion',
            'redirect_to' => '/api/register/student' // Use your existing endpoint
        ]);
    }

    /**
     * Complete tutor profile (Step 2 for tutors)
     */
    public function completeTutorProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isTutor()) {
            return response()->json([
                'success' => false,
                'message' => 'Only tutors can complete tutor profile'
            ], 403);
        }

        if (!$user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Redirect to existing tutor profile completion',
            'redirect_to' => '/api/register/tutor' // Use your existing endpoint
        ]);
    }

    /**
     * Check if profile is completed
     */
    public function checkProfileCompletion(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'profile_completed' => $user->isProfileCompleted(),
            'user' => [
                'id' => $user->id,
                'role' => $user->role,
                'status' => $user->status,
            ]
        ]);
    }
}