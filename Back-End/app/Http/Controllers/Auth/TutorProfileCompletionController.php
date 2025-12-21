<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\TutorSubject;
use App\Models\TutorAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TutorProfileCompletionController extends Controller
{
    public function completeProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isTutor() || $user->status !== 'pending_profile') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized or already completed profile'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'age' => 'required|integer|min:18|max:100',
            'sex' => 'required|in:male,female',
            'country' => 'required|string',
            'city' => 'nullable|string',
            'address' => 'required|string',
            'bio' => 'required|string|min:50|max:1000',
            'qualification' => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0|max:50',
            'hourly_rate' => 'required|numeric|min:0',
            'degree_photo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'subjects' => 'required|array|min:1',
            'subjects.*.name' => 'required|string',
            'subjects.*.specialization' => 'nullable|string',
            'subjects.*.level' => 'required|in:beginner,intermediate,advanced',
            'availability' => 'required|array|min:1',
            'availability.*.day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'availability.*.start_time' => 'required|date_format:H:i',
            'availability.*.end_time' => 'required|date_format:H:i|after:availability.*.start_time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $tutor = $user->tutor;

            // Handle degree photo upload
            $degreePhotoPath = null;
            if ($request->hasFile('degree_photo')) {
                $degreePhoto = $request->file('degree_photo');
                $degreePhotoPath = $degreePhoto->store('degree-photos', 'public');
            }

            // Update tutor profile
            $tutor->update([
                'age' => $request->age,
                'sex' => $request->sex,
                'country' => $request->country,
                'city' => $request->city,
                'address' => $request->address,
                'bio' => $request->bio,
                'qualification' => $request->qualification,
                'degree_photo' => $degreePhotoPath,
                'experience_years' => $request->experience_years,
                'hourly_rate' => $request->hourly_rate,
            ]);

            // Update subjects
            $tutor->subjects()->delete(); // Remove old subjects
            foreach ($request->subjects as $subject) {
                TutorSubject::create([
                    'tutor_id' => $tutor->id,
                    'subject_name' => $subject['name'],
                    'specialization' => $subject['specialization'] ?? null,
                    'level' => $subject['level'],
                ]);
            }

            // Update availability
            $tutor->availability()->delete();
            foreach ($request->availability as $slot) {
                TutorAvailability::create([
                    'tutor_id' => $tutor->id,
                    'day_of_week' => $slot['day'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                ]);
            }

            // Update user status
            $user->status = 'pending_approval';
            $user->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Profile completed successfully! Waiting for admin approval.',
                'user' => [
                    'id' => $user->id,
                    'status' => $user->status,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}