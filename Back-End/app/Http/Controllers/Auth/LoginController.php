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

        // First, find the user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check credentials
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check user status
        if ($user->status === 'suspended') {
            throw ValidationException::withMessages([
                'email' => 'Your account has been suspended. Please contact the administrator.',
            ]);
        }

        // For tutors, check if they are approved
        if ($user->isTutor()) {
            switch ($user->status) {
                case 'pending':
                    throw ValidationException::withMessages([
                        'email' => 'Your tutor account is pending admin approval. You will be notified via email once approved.',
                    ]);
                    break;
                    
                case 'rejected':
                    $reason = $user->tutor->rejection_reason ?? 'unspecified reason';
                    throw ValidationException::withMessages([
                        'email' => "Your tutor application was rejected. Reason: $reason. Please contact admin for more information.",
                    ]);
                    break;
                    
                case 'active':
                    // Tutor is approved, continue with login
                    break;
                    
                default:
                    // For any other status, prevent login
                    throw ValidationException::withMessages([
                        'email' => 'Your account is not active. Please contact the administrator.',
                    ]);
            }
        }

        // For students and other roles, check if they are active
        if (!$user->isTutor() && $user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => 'Your account is not active. Please contact the administrator.',
            ]);
        }

        // Create token and return response
        $token = $user->createToken('auth-token')->plainTextToken;

        // Update last login
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $this->getUserWithProfile($user),
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
        ];

        if ($user->isStudent() && $user->student) {
            $userData['profile'] = [
                'id' => $user->student->id,
                'father_name' => $user->student->father_name,
                'age' => $user->student->age,
            ];
        }

        if ($user->isTutor() && $user->tutor) {
            $userData['profile'] = [
                'id' => $user->tutor->id,
                'qualification' => $user->tutor->qualification,
                'experience_years' => $user->tutor->experience_years,
                'hourly_rate' => $user->tutor->hourly_rate,
                'is_verified' => $user->tutor->is_verified,
                'rejection_reason' => $user->tutor->rejection_reason, // Include rejection reason if any
            ];
        }

        return $userData;
    }
}