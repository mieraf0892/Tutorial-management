<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailQueue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\EmailVerificationMail;
use App\Mail\StudentWelcomeMail;
use App\Mail\TutorPendingApprovalMail;

class EmailVerificationController extends Controller
{
    /**
     * Verify email address
     */
    public function verify(Request $request, $token = null)
    {
        $token = $token ?? $request->input('token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Verification token is required'
            ], 400);
        }

        $user = User::where('email_verification_token', $token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification token'
            ], 400);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 400);
        }

        // Update user verification status
        $user->email_verified_at = now();
        $user->email_verification_token = null;

        // Handle based on user type
        if ($user->isStudent()) {
            $user->status = 'active';
            $user->save();

            // Send welcome email
            try {
                Mail::to($user->email)->send(new StudentWelcomeMail($user));
            } catch (\Exception $e) {
                Log::error('Failed to send welcome email: ' . $e->getMessage());
            }

            $message = 'Email verified successfully! Your student account is now active.';
            $redirect_to = '/dashboard';
        } else {
            // For tutors: create tutor record if doesn't exist
            $user->status = 'pending_approval';
            $user->save();

            // Create tutor record if it doesn't exist
            if (!$user->tutor()->exists()) {
                \App\Models\Tutor::create([
                    'user_id' => $user->id,
                    'phone' => $user->phone,
                    'degree_verified' => 'pending',
                    'is_verified' => false,
                ]);
            }

            // Send pending approval notification
            try {
                Mail::to($user->email)->send(new TutorPendingApprovalMail($user));
            } catch (\Exception $e) {
                Log::error('Failed to send tutor profile completion email: ' . $e->getMessage());
            }

            $message = 'Email verified successfully! Your tutor application is pending admin approval.';
            $redirect_to = '/tutor/dashboard';
        }

        // Mark email as viewed in queue
        if (app()->environment('local', 'development', 'testing')) {
            EmailQueue::where('token', $token)
                ->where('type', 'verification')
                ->whereNull('viewed_at')
                ->update(['viewed_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified' => true,
            ],
            'redirect_to' => $redirect_to
        ]);
    }

    /**
     * Resend verification email
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 400);
        }

        // Generate new token if needed
        if (!$user->email_verification_token) {
            $user->email_verification_token = $this->generateVerificationToken();
            $user->save();
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'success' => true,
            'message' => 'Verification email resent successfully'
        ]);
    }

    /**
     * Check registration status
     */
    public function checkStatus(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified' => !is_null($user->email_verified_at),
                'can_login' => $user->canLogin(),
            ]
        ]);
    }

    /**
     * Helper: Generate verification token
     */
    private function generateVerificationToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Helper: Send verification email
     */
    private function sendVerificationEmail(User $user)
    {
        $verificationUrl = url('/api/verify-email/' . $user->email_verification_token);

        if (app()->environment('local', 'development', 'testing')) {
            // Store in email queue for development
            EmailQueue::create([
                'user_id' => $user->id,
                'type' => 'verification',
                'to' => $user->email,
                'subject' => 'Verify Your Email Address',
                'content' => "Hello {$user->name},\n\nPlease verify your email: {$verificationUrl}",
                'token' => $user->email_verification_token,
                'verification_url' => $verificationUrl,
                'sent_at' => now(),
            ]);
        } else {
            // Send real email in production
            Mail::to($user->email)->send(new EmailVerificationMail($user));
        }
    }
}