<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentLearningPreference;
use App\Models\StudentCourseDetail;
use App\Models\User;
use App\Models\EmailQueue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use App\Mail\EmailVerificationMail;
use Illuminate\Validation\Rule;

class StudentAuthController extends Controller
{
    public function register(Request $request)
{
    $captchaToken = $request->input('captcha_token');

    if (!$captchaToken) {
        return response()->json([
            'success' => false,
            'message' => 'CAPTCHA verification required.'
        ], 422);
    }

    // ✅ ADD DEBUGGING LOGS
    Log::info('CAPTCHA Debug - Before Verification', [
        'captcha_token_exists' => !empty($captchaToken),
        'captcha_token_length' => strlen($captchaToken),
        'environment' => app()->environment(),
        'secret_key_exists' => !empty(env('RECAPTCHA_SECRET_KEY')),
        'user_ip' => $request->ip(),
    ]);

    // Verify reCAPTCHA with Google
    $secretKey = env('RECAPTCHA_SECRET_KEY');
    
    // ✅ Check if secret key is configured
    if (!$secretKey) {
        Log::error('CAPTCHA secret key not configured in .env');
        return response()->json([
            'success' => false,
            'message' => 'CAPTCHA configuration error. Please contact administrator.',
            'debug' => app()->environment('local', 'development') ? 'RECAPTCHA_SECRET_KEY not set in .env' : null
        ], 500);
    }

    $captchaResponse = Http::withoutVerifying()->asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
        'secret' => $secretKey,
        'response' => $captchaToken,
        'remoteip' => $request->ip(),
    ]);

    $captchaBody = $captchaResponse->json();

    // ✅ ADD MORE DEBUGGING
    Log::info('CAPTCHA Debug - After Verification', [
        'captcha_response_success' => $captchaBody['success'] ?? false,
        'captcha_error_codes' => $captchaBody['error-codes'] ?? [],
        'captcha_hostname' => $captchaBody['hostname'] ?? '',
        'captcha_action' => $captchaBody['action'] ?? '',
        'captcha_score' => $captchaBody['score'] ?? 0,
        'full_response' => $captchaBody,
    ]);

    if (empty($captchaBody['success']) || $captchaBody['success'] !== true) {
        Log::warning('CAPTCHA verification failed', [
            'captcha_response' => $captchaBody,
            'user_ip' => $request->ip()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'CAPTCHA verification failed. Please try again.',
            'debug' => app()->environment('local', 'development') ? [
                'error_codes' => $captchaBody['error-codes'] ?? [],
                'hostname' => $captchaBody['hostname'] ?? '',
                'score' => $captchaBody['score'] ?? 0,
            ] : null
        ], 422);
    }

        // Start database transaction
        DB::beginTransaction();

        try {
            
            // Create User with pending status and verification token
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'phone' => $request->phone,
                'status' => 'pending', 
                'email_verified_at' => null,
            ]);

            // Create Student
            $student = Student::create([
                'user_id' => $user->id,
                'father_name' => $request->fatherName,
                'age' => $request->age,
                'parent_email' => $request->parentEmail,
                'sex' => $request->sex,
                'country' => $request->country,
                'phone_code' => $request->phoneCode,
                'city' => $request->city,
                'subcity' => $request->subcity,
                'address' => $request->address,
                'course_type' => $request->courseType,
            ]);

            // Create Learning Preferences
            StudentLearningPreference::create([
                'student_id' => $student->id,
                'learning_mode' => $request->learningMode,
                'learning_preference' => $request->learningPreference,
                'study_days' => $request->studyDays,
                'hours_per_day' => $request->hoursPerDay,
            ]);

            // Create Course Details based on course type
            $this->saveCourseDetails($student->id, $request);

            // Generate secure, temporary signed verification URL (expires in 72 hours)
            $verificationUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',              // the route name we added in web.php
                now()->addHours(72),                // link valid for 3 days
                [
                    'id'   => $user->getKey(),      // user ID
                    'hash' => sha1($user->getEmailForVerification()), // email hash for extra security
                ]
            );

            // Send email verification
            $emailResult = $this->sendEmailVerification($user, $verificationUrl);

            // Prepare response
            $response = [
                'success' => true,
                'message' => 'Student registered successfully! Please check your email for verification.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'requires_email_verification' => true,
                ]
            ];

            // Add development info if in development mode
            if (app()->environment('local', 'development', 'testing') && isset($emailResult['development_mode'])) {
                $response['development_info'] = [
                    'email_simulated' => true,
                    'verification_url' => $emailResult['verification_url'],
                    'email_queue_view_url' => url('/api/email-queue'),
                    'message' => 'In development mode: Email stored in queue instead of being sent.'
                ];
            }

            DB::commit();

            return response()->json($response, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Student registration error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   /**
 * Send email verification
 */
private function sendEmailVerification(User $user, string $verificationUrl): array
{
    // if (app()->environment('local', 'development', 'testing')) {
    //     // Store in email queue for development (no real send)
    //     $email = EmailQueue::create([
    //         'user_id'        => $user->id,
    //         'type'           => 'verification',
    //         'to'             => $user->email,
    //         'subject'        => 'Verify Your Email Address - Tutorial Management System',
    //         'content'        => "Hello {$user->name},\n\n" .
    //                            "Please click the link below to verify your email address:\n\n" .
    //                            "{$verificationUrl}\n\n" .
    //                            "This link will expire in 72 hours.\n\n" .
    //                            "If you did not create an account, no further action is required.\n\n" .
    //                            "Best regards,\nTutorial Management System Team",
    //         'verification_url' => $verificationUrl,
    //         'sent_at'        => now(),
    //         'is_verification' => true,
    //     ]);

    //     Log::info('Email verification stored in queue from StudentAuthController', [
    //         'user_id'         => $user->id,
    //         'email'           => $user->email,
    //         'verification_url' => $verificationUrl,
    //         'email_queue_id'  => $email->id
    //     ]);

    //     return [
    //         'sent'            => false,
    //         'development_mode' => true,
    //         'verification_url' => $verificationUrl,
    //         'email_queue_id'  => $email->id,
    //     ];
    // }

    // Production / real email sending (Mailtrap in dev if SMTP is configured)
    try {
        Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));

        Log::info('Verification email sent successfully to: ' . $user->email);

        return ['sent' => true];
    } catch (\Exception $e) {
        Log::error('Failed to send verification email to ' . $user->email . ': ' . $e->getMessage());

        return [
            'sent'  => false,
            'error' => $e->getMessage()
        ];
    }
}

    private function saveCourseDetails($studentId, $request)
{
    $courseType = $request->courseType;
    
    // Clean emoji helper function
    $cleanEmoji = function($value) {
        return trim(str_replace(['🧠', '💻', '📱', '🇪🇹', '🇬🇧', '🇨🇳', '🇸🇦', '🇫🇷'], '', $value));
    };
    
    switch ($courseType) {
        case 'Programming':
            if (!empty($request->selectedArea) && is_array($request->selectedArea)) {
                foreach ($request->selectedArea as $area) {
                    $cleanArea = $cleanEmoji($area);
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'programming_area', // Keep consistent
                        'field_value' => $cleanArea // Save without emoji
                    ]);
                    
                    // ALSO save as 'selected_area' for backward compatibility
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'selected_area', // Add this
                        'field_value' => $cleanArea
                    ]);
                }
            }
            break;
            
        case 'Language':
            if (!empty($request->selectedLanguages) && is_array($request->selectedLanguages)) {
                foreach ($request->selectedLanguages as $language) {
                    $cleanLanguage = $cleanEmoji($language);
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'language', // Changed from 'selected_language'
                        'field_value' => $cleanLanguage
                    ]);
                    
                    // ALSO save as 'selected_language' for backward compatibility
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'selected_language',
                        'field_value' => $cleanLanguage
                    ]);
                }
            }
            break;
            
        case 'School Grades':
            // Save grade
            if (!empty($request->selectedGrade)) {
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'grade',
                    'field_value' => $request->selectedGrade
                ]);
            }
            
            // Save curriculum
            if (!empty($request->selectedCurriculum)) {
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'curriculum',
                    'field_value' => $request->selectedCurriculum
                ]);
            }
            
            // Save subjects
            if (!empty($request->selectedSubjects) && is_array($request->selectedSubjects)) {
                foreach ($request->selectedSubjects as $subject) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'subject',
                        'field_value' => $subject
                    ]);
                }
            }
            break;
            
        case 'Entrance Preparation':
            if (!empty($request->selectedExam)) {
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'exam',
                    'field_value' => $request->selectedExam
                ]);
                
                // ALSO save as 'selected_exam' for compatibility
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'selected_exam',
                    'field_value' => $request->selectedExam
                ]);
            }
            break;
    }
}
}