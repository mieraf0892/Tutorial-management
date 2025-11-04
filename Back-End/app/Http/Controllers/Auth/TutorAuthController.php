<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\TutorSubject;
use App\Models\TutorAvailability;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
            ]);

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
                'experience_years' => $request->experienceYears,
                'hourly_rate' => $request->hourlyRate,
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

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tutor registered successfully!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Tutor registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}