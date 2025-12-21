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
        'secret_key_exists' => !empty(env('GOOGLE_RECAPTCHA_SECRET')),
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
            'debug' => app()->environment('local', 'development') ? 'GOOGLE_RECAPTCHA_SECRET not set in .env' : null
        ], 500);
    }

    $captchaResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
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
            // Generate email verification token
            $emailVerificationToken = bin2hex(random_bytes(32));
            
            // Create User with pending status and verification token
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'phone' => $request->phone,
                'status' => 'pending', // Set to pending until email verification
                'email_verification_token' => $emailVerificationToken,
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

            // Send email verification
            $emailResult = $this->sendEmailVerification($user);

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
    private function sendEmailVerification(User $user): array
    {
        $verificationUrl = url('/api/verify-email/' . $user->email_verification_token);
        
        if (app()->environment('local', 'development', 'testing')) {
            // Store in email queue for development
            $email = EmailQueue::create([
                'user_id' => $user->id,
                'type' => 'verification',
                'to' => $user->email,
                'subject' => 'Verify Your Email Address - Tutorial Management System',
                'content' => "Hello {$user->name},\n\nPlease click the link below to verify your email address:\n\n{$verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, no further action is required.\n\nBest regards,\nTutorial Management System Team",
                'token' => $user->email_verification_token,
                'verification_url' => $verificationUrl,
                'sent_at' => now(),
                'is_verification' => true,
            ]);
            
            Log::info('Email verification stored in queue from StudentAuthController', [
                'user_id' => $user->id,
                'email' => $user->email,
                'verification_url' => $verificationUrl,
                'email_queue_id' => $email->id
            ]);
            
            return [
                'sent' => false,
                'development_mode' => true,
                'verification_url' => $verificationUrl,
                'email_queue_id' => $email->id,
            ];
        } else {
            // Send real email in production
            try {
                Mail::to($user->email)->send(new EmailVerificationMail($user));
                return ['sent' => true];
            } catch (\Exception $e) {
                Log::error('Failed to send verification email to ' . $user->email . ': ' . $e->getMessage());
                return ['sent' => false, 'error' => $e->getMessage()];
            }
        }
    }

    private function saveCourseDetails($studentId, $request)
    {
        $courseType = $request->courseType;
        
        switch ($courseType) {
            case 'Programming':
                foreach ($request->selectedArea as $area) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'programming_area',
                        'field_value' => $area
                    ]);
                }
                break;
                
            case 'Language':
                foreach ($request->selectedLanguages as $language) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'selected_language',
                        'field_value' => $language
                    ]);
                }
                break;
                
            case 'School Grades':
                // Save grade
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'grade',
                    'field_value' => $request->selectedGrade
                ]);
                
                // Save curriculum
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'curriculum',
                    'field_value' => $request->selectedCurriculum
                ]);
                
                // Save subjects
                foreach ($request->selectedSubjects as $subject) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'subject',
                        'field_value' => $subject
                    ]);
                }
                break;
                
            case 'Entrance Preparation':
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'exam',
                    'field_value' => $request->selectedExam
                ]);
                break;
        }
    }
}