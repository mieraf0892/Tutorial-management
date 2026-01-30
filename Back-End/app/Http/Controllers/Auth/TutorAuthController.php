<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\TutorSubject;
use App\Models\TutorAvailability;
use App\Models\User;
use App\Models\EmailQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmailVerificationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage; // ADD THIS

class TutorAuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            // User data
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            
            // Tutor personal information
            'phone' => 'required|string',
            'age' => 'required|integer|min:18|max:100',
            'sex' => 'required|in:male,female',
            'country' => 'required|string',
            'phoneCode' => 'required|string',
            'city' => 'nullable|string',
            'subcity' => 'nullable|string',
            'address' => 'required|string',
            
            // Professional information
            'bio' => 'required|string|min:50|max:1000',
            'qualification' => 'required|string|max:255',
            'experienceYears' => 'required|integer|min:0|max:50',
            'hourlyRate' => 'required|numeric|min:0',
            
            // ADD: Degree photo validation
            'degreePhoto' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
            
            // Subjects and specializations
            'subjects' => 'required|array|min:1',
            'subjects.*.name' => 'required|string',
            'subjects.*.specialization' => 'nullable|string',
            'subjects.*.level' => 'required|in:beginner,intermediate,advanced',
            
            // Availability
            'availability' => 'required|array|min:1',
            'availability.*.day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'availability.*.startTime' => 'required|date_format:H:i',
            'availability.*.endTime' => 'required|date_format:H:i|after:availability.*.startTime',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Create User
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'tutor',
                'phone' => $request->phone,
                'status' => 'pending',
            ]);

            // Generate secure, temporary signed verification URL (expires in 72 hours)
            $verificationUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',
                now()->addHours(72),
                [
                    'id'   => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );

            // Handle degree photo upload
            $degreePhotoPath = null;
            if ($request->hasFile('degreePhoto')) {
                $degreePhoto = $request->file('degreePhoto');
                // Store in storage/app/public/degree-photos
                $degreePhotoPath = $degreePhoto->store('degree-photos', 'public');
            }

            // Create Tutor
            $tutor = Tutor::create([
                'user_id' => $user->id,
                'phone' => $request->phone,
                'age' => $request->age,
                'sex' => $request->sex,
                'country' => $request->country,
                'phone_code' => $request->phoneCode,
                'city' => $request->city,
                'subcity' => $request->subcity,
                'address' => $request->address,
                'bio' => $request->bio,
                'qualification' => $request->qualification,
                'degree_photo' => $degreePhotoPath, // ADD THIS
                'degree_verified' => 'pending', // ADD THIS - default status
                'experience_years' => $request->experienceYears,
                'hourly_rate' => $request->hourlyRate,
                'is_verified' => false,
            ]);

            // Create Tutor Subjects
            foreach ($request->subjects as $subject) {
                TutorSubject::create([
                    'tutor_id' => $tutor->id,
                    'subject_name' => $subject['name'],
                    'specialization' => $subject['specialization'] ?? null,
                    'level' => $subject['level'],
                ]);
            }

            // Create Tutor Availability
            foreach ($request->availability as $slot) {
                TutorAvailability::create([
                    'tutor_id' => $tutor->id,
                    'day_of_week' => $slot['day'],
                    'start_time' => $slot['startTime'],
                    'end_time' => $slot['endTime'],
                ]);
            }

             // Send verification email
            $this->sendVerificationEmail($user, $verificationUrl);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tutor registration submitted for admin approval! You will be notified once approved.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                ],
                'degree_photo_uploaded' => !empty($degreePhotoPath), // ADD THIS
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Delete uploaded file if transaction fails
            if (!empty($degreePhotoPath) && Storage::disk('public')->exists($degreePhotoPath)) {
                Storage::disk('public')->delete($degreePhotoPath);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Tutor registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ADD THIS: Helper function to get degree photo URL
    public function getDegreePhoto($tutorId)
    {
        try {
            $tutor = Tutor::findOrFail($tutorId);
            
            if (!$tutor->degree_photo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Degree photo not found'
                ], 404);
            }

            // Check if file exists
            if (!Storage::disk('public')->exists($tutor->degree_photo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Degree photo file not found'
                ], 404);
            }

            // Return the file
            return Storage::disk('public')->response($tutor->degree_photo);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching degree photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

/**
 * Send verification email
 */
    private function sendVerificationEmail(User $user, string $verificationUrl)
    {
        // Production / real email sending (Mailtrap in dev if SMTP is configured)
            try {
                Mail::to($user->email)
                    ->send(new EmailVerificationMail($user, $verificationUrl));

                Log::info('Verification email sent successfully to: ' . $user->email);
            } catch (\Exception $e) {
                Log::error('Failed to send verification email to ' . $user->email . ': ' . $e->getMessage());
            }
        // if (app()->environment('local', 'development', 'testing')) {
            // Store in email queue for development (no real send)
        //     $email = EmailQueue::create([
        //         'user_id'          => $user->id,
        //         'type'             => 'verification',
        //         'to'               => $user->email,
        //         'subject'          => 'Verify Your Email Address - Tutorial Management System',
        //         'content'          => "Hello {$user->name},\n\n" .
        //                          "Please click the link below to verify your email address:\n\n" .
        //                          "{$verificationUrl}\n\n" .
        //                          "This link will expire in 72 hours.\n\n" .
        //                          "If you did not create an account, no further action is required.\n\n" .
        //                          "Best regards,\nTutorial Management System Team",
        //         'verification_url' => $verificationUrl,
        //         'sent_at'          => now(),
        //     ]);

        //     Log::info('Email verification stored in queue from TutorAuthController', [
        //         'user_id'         => $user->id,
        //         'email'           => $user->email,
        //         'verification_url' => $verificationUrl,
        //         'email_queue_id'  => $email->id ?? 'N/A'
        //     ]);
        // } else {
            
        // }
    }
} 