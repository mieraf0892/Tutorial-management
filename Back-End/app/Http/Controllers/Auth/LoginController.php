<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // Find user
    $user = User::where('email', $request->email)->first();

    if (!$user) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    // Check password
    if (!Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    // Check email verification
    if (!$user->isEmailVerified()) {
        throw ValidationException::withMessages([
            'email' => 'Please verify your email address before logging in. Check your email for verification link.',
        ]);
    }

    // Check user status
    if ($user->isSuspended()) {
        throw ValidationException::withMessages([
            'email' => 'Your account has been suspended. Please contact the administrator.',
        ]);
    }

    // ============================================
    // UPDATED TUTOR STATUS CHECK
    // ============================================
    if ($user->isTutor()) {
        // Check different statuses
        switch ($user->status) {
            case 'pending_email_verification':
                throw ValidationException::withMessages([
                    'email' => 'Please verify your email address before logging in. Check your email for verification link.',
                ]);
                
            case 'pending_profile':
                throw ValidationException::withMessages([
                    'email' => 'Please complete your tutor profile to proceed with admin approval.',
                ]);
                
            case 'pending_approval':
                throw ValidationException::withMessages([
                    'email' => 'Your tutor account is pending admin approval. You will be notified via email once approved.',
                ]);
                
            case 'rejected':
                $reason = $user->tutor->rejection_reason ?? 'unspecified reason';
                throw ValidationException::withMessages([
                    'email' => "Your tutor application was rejected. Reason: $reason",
                ]);
                
            case 'suspended':
                throw ValidationException::withMessages([
                    'email' => 'Your account has been suspended. Please contact the administrator.',
                ]);
                
            case 'active':
                // Allow login - continue with normal flow
                break;
                
            default:
                throw ValidationException::withMessages([
                    'email' => 'Your account status is invalid. Please contact the administrator.',
                ]);
        }
    }

    // For students
    if ($user->isStudent() && !$user->isActive()) {
        throw ValidationException::withMessages([
            'email' => 'Your account is not active. Please contact the administrator.',
        ]);
    }

    // Create token
    $token = $user->createToken('auth-token')->plainTextToken;

    // Update last login
    $user->update(['last_login_at' => now()]);

    // Get user data
    $userData = $this->getUserWithProfile($user);
    
    // Additional check for tutors who are active but haven't completed profile
    if ($user->isTutor() && $user->isActive() && !$user->isProfileCompleted()) {
        return response()->json([
            'success' => true,
            'message' => 'Login successful. Please complete your profile.',
            'user' => $userData,
            'token' => $token,
            'action_required' => 'complete_profile',
            'redirect_to' => '/tutor/profile/complete'
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'user' => $userData,
        'token' => $token
    ]);
}

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    private function getUserWithProfile($user)
    {
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'role_display' => $user->getRoleDisplayName(),
            'phone' => $user->phone,
            'status' => $user->status,
            'email_verified' => $user->isEmailVerified(),
            'profile_completed' => $user->isProfileCompleted(),
        ];

        if ($user->isStudent() && $user->student) {
            $userData['profile'] = [
                'id' => $user->student->id,
                'father_name' => $user->student->father_name,
                'age' => $user->student->age,
                'course_type' => $user->student->course_type,
            ];
        }

        if ($user->isTutor() && $user->tutor) {
    $userData['profile'] = [
        'id' => $user->tutor->id,
        'qualification' => $user->tutor->qualification,
        'experience_years' => $user->tutor->experience_years,
        'hourly_rate' => $user->tutor->hourly_rate,
        'is_verified' => $user->tutor->is_verified,
        'rejection_reason' => $user->tutor->rejection_reason,
        'degree_verified' => $user->tutor->degree_verified,
        'degree_photo' => $user->tutor->degree_photo,
        'subjects_count' => $user->tutor->subjects ? $user->tutor->subjects->count() : 0,
        'availability_count' => $user->tutor->availability ? $user->tutor->availability->count() : 0,
    ];
}

        return $userData;
    }
}