<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailQueue;
use App\Mail\StudentWelcomeEmail;
use App\Mail\TutorWelcomeEmail;
use App\Mail\EmailVerificationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmailVerificationController extends Controller
{
    /**
     * Verify email with token
     */
    public function verify(Request $request, $id, $hash)
    {
        // The 'signed' middleware already validated signature & expiration
        // Extra safety check
        if (!$request->hasValidSignature()) {
            return redirect('/email/verify/expired')
                ->with('error', 'This verification link is invalid or has expired.');
        }

        $user = User::find($id);

        if (!$user) {
            return redirect('/email/verify/expired')
                ->with('error', 'User not found.');
        }

        // Verify hash matches (security)
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect('/email/verify/expired')
                ->with('error', 'Invalid verification link.');
        }

        // Already verified?
        if ($user->email_verified_at) {
            return redirect($this->getRedirectUrl($user))
                ->with('info', 'Your email is already verified.');
        }

        DB::beginTransaction();

        try {
            // Mark as verified
            $user->email_verified_at = now();
            // No need for email_verification_token anymore → can be null or dropped
            $user->email_verification_token = null;

            // Role-based status & welcome email
            $welcomeEmailSent = false;

            if ($user->role === 'student') {
                $user->status = 'active';

                $student = $user->student;
                if ($student) {
                    Mail::to($user->email)->send(new StudentWelcomeEmail($user, $student));
                    $welcomeEmailSent = true;
                    Log::info('Student welcome email sent after verification', ['user_id' => $user->id]);
                }
            } elseif ($user->role === 'tutor') {
                $user->status = 'pending'; // or 'pending' as you prefer
                $user->save();

                $welcomeEmailSent = false;
                Log::info('Tutor email verified – now pending admin approval', ['user_id' => $user->id]);
            } else {
                $user->status = 'active';
            }

            $user->save();

            // Dev queue marking (optional)
            if (app()->environment('local', 'development', 'testing')) {
                EmailQueue::where('user_id', $user->id)
                    ->where('type', 'verification')
                    ->whereNull('viewed_at')
                    ->update(['viewed_at' => now()]);
            }

            DB::commit();

                    return redirect($this->getRedirectUrl($user))
                        ->with('success', $user->role === 'student'
                            ? 'Email verified! Your account is now active. Redirecting to dashboard...'
                            : 'Email verified! Your tutor account is under review. You will be notified soon.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Email verification failed', [
                'user_id' => $user->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ]);

            return redirect('/email/verify/expired')
                ->with('error', 'Verification failed. Please try again or contact support.');
        }
    }

   /**
 * Helper: Get frontend redirect URL based on role
 */
private function getRedirectUrl(User $user): string
{
    $base = 'http://localhost:5173';
    return $base . '/?verified=success&role=' . $user->role;
     

    if ($user->role === 'student') {
        return $base . '/student?verified=success';
    }

    if ($user->role === 'tutor') {
        // Pending approval instead of direct tutor dashboard
        return $base . '/registration-pending?verified=success&role=tutor';
    }

    // Fallback
    return $base . '/';
}

    /**
     * Resend verification email (updated to use signed URL)
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => true,
                'message' => 'Email is already verified.',
            ], 200);
        }

        // Generate fresh signed URL
        $verificationUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(72),
            [
                'id'   => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        if (app()->environment('local', 'development', 'testing')) {
            EmailQueue::create([
                'user_id'          => $user->id,
                'type'             => 'verification_resend',
                'to'               => $user->email,
                'subject'          => 'Resend: Verify Your Email Address',
                'content'          => "Hello {$user->name},\n\nPlease click to verify:\n\n{$verificationUrl}\n\nExpires in 72 hours.",
                'verification_url' => $verificationUrl,
                'sent_at'          => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Verification link resent. Check your email queue.',
                'verification_url' => $verificationUrl, // for dev testing
            ], 200);
        }

        // Production send
        try {
            Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));

            return response()->json([
                'success' => true,
                'message' => 'Verification email resent. Check your inbox.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Resend failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend verification email.',
            ], 500);
        }
    }

    /**
     * Check verification status (unchanged)
     */
    public function checkStatus(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        return response()->json([
            'success'         => true,
            'email_verified'  => !is_null($user->email_verified_at),
            'status'          => $user->status,
            'role'            => $user->role,
            'needs_verification' => is_null($user->email_verified_at),
        ], 200);
    }
}