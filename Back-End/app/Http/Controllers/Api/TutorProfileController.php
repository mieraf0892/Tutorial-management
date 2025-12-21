<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Tutor;
use App\Models\TutorSubject;
use App\Models\TutorAvailability;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class TutorProfileController extends Controller
{
    /**
     * Get tutor profile
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();
        
            if ($user->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Tutors only.'
                ], 403);
            }

            $tutor = $user->tutor;
            
            if (!$tutor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }

            // Load relationships
            $tutor->load(['subjects', 'availability', 'tutorials']);

            return response()->json([
                'success' => true,
                'profile' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                    ],
                    'tutor' => $tutor,
                    'stats' => [
                        'total_tutorials' => $tutor->tutorials->count(),
                        'total_students' => \App\Models\Enrollment::whereIn('tutorial_id', $tutor->tutorials->pluck('id'))->distinct('user_id')->count(),
                        'completion_rate' => 0, // You can calculate this later
                        'average_rating' => 4.5, // You can calculate this later
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Tutor profile error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load tutor profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update tutor profile
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();
        
            if ($user->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Tutors only.'
                ], 403);
            }

            $tutor = $user->tutor;
            
            if (!$tutor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }

            $validated = $request->validate([
                'phone' => 'nullable|string|max:20',
                'age' => 'nullable|integer|min:18|max:100',
                'sex' => 'nullable|in:male,female,other',
                'country' => 'nullable|string|max:100',
                'city' => 'nullable|string|max:100',
                'subcity' => 'nullable|string|max:100',
                'address' => 'nullable|string|max:255',
                'bio' => 'nullable|string|max:1000',
                'qualification' => 'nullable|string|max:255',
                'experience_years' => 'nullable|integer|min:0|max:50',
                'hourly_rate' => 'nullable|numeric|min:0',
            ]);

            $tutor->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'profile' => $tutor->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Update tutor profile error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload profile photo
     */
    public function uploadPhoto(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Tutors only.'
                ], 403);
            }

            $request->validate([
                'photo' => 'required|image|max:2048', // 2MB max
            ]);

            $tutor = $user->tutor;
            
            if (!$tutor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }

            // Store the photo (you'll need to implement file storage)
            $path = $request->file('photo')->store('profile-photos', 'public');
            
            $tutor->update([
                'profile_photo' => $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile photo updated successfully',
                'photo_url' => asset('storage/' . $path)
            ]);

        } catch (\Exception $e) {
            Log::error('Profile photo upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload profile photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user contact information
     */
    public function updateContact(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Tutors only.'
                ], 403);
            }

            $validated = $request->validate([
                'phone' => 'nullable|string|max:20',
                'email' => 'required|email|unique:users,email,' . $user->id,
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Contact information updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Update contact info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update contact information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Tutors only.'
                ], 403);
            }

            $validated = $request->validate([
                'current_password' => 'required|current_password',
                'new_password' => 'required|min:8|confirmed',
            ]);

            $user->update([
                'password' => bcrypt($validated['new_password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Change password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Complete tutor profile (for tutors with pending_profile status)
 */
public function completeProfile(Request $request)
{
    // Start database transaction
    DB::beginTransaction();
    
    try {
        $user = $request->user();
        
        // Check if user is tutor
        if (!$user->isTutor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Tutors only.'
            ], 403);
        }
        
        // Only allow tutors with pending_profile status
        if ($user->status !== 'pending_profile') {
            return response()->json([
                'success' => false,
                'message' => 'Profile already completed or approved. Current status: ' . $user->status
            ], 400);
        }
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            // Personal information
            'phone' => 'required|string',
            'age' => 'required|integer|min:18|max:100',
            'sex' => 'required|in:male,female',
            'country' => 'required|string',
            'city' => 'nullable|string',
            'subcity' => 'nullable|string',
            'address' => 'required|string',
            
            // Professional information
            'bio' => 'required|string|min:50|max:1000',
            'qualification' => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0|max:50',
            'hourly_rate' => 'required|numeric|min:0',
            
            // Degree photo
            'degree_photo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
            
            // Subjects and specializations
            'subjects' => 'required|array|min:1',
            'subjects.*.name' => 'required|string',
            'subjects.*.specialization' => 'nullable|string',
            'subjects.*.level' => 'required|in:beginner,intermediate,advanced',
            
            // Availability
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
        
        // Handle degree photo upload
        $degreePhotoPath = null;
        if ($request->hasFile('degree_photo')) {
            $degreePhoto = $request->file('degree_photo');
            $degreePhotoPath = $degreePhoto->store('degree-photos', 'public');
        }
        
        // Create or update tutor profile
        $tutor = Tutor::updateOrCreate(
            ['user_id' => $user->id],
            [
                'phone' => $request->phone,
                'age' => $request->age,
                'sex' => $request->sex,
                'country' => $request->country,
                'city' => $request->city,
                'subcity' => $request->subcity,
                'address' => $request->address,
                'bio' => $request->bio,
                'qualification' => $request->qualification,
                'degree_photo' => $degreePhotoPath,
                'degree_verified' => 'pending',
                'experience_years' => $request->experience_years,
                'hourly_rate' => $request->hourly_rate,
                'is_verified' => false,
            ]
        );
        
        // Delete existing subjects and availability (if any)
        TutorSubject::where('tutor_id', $tutor->id)->delete();
        TutorAvailability::where('tutor_id', $tutor->id)->delete();
        
        // Create subjects
        foreach ($request->subjects as $subject) {
            TutorSubject::create([
                'tutor_id' => $tutor->id,
                'subject_name' => $subject['name'],
                'specialization' => $subject['specialization'] ?? null,
                'level' => $subject['level'],
            ]);
        }
        
        // Create availability
        foreach ($request->availability as $slot) {
            TutorAvailability::create([
                'tutor_id' => $tutor->id,
                'day_of_week' => $slot['day'],
                'start_time' => $slot['start_time'],
                'end_time' => $slot['end_time'],
            ]);
        }
        
        // Update user status to pending_approval
        $user->status = 'pending_approval';
        $user->save();
        
        DB::commit();
        
        // Send notification to admin (optional)
        $this->notifyAdminForApproval($tutor);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile completed and submitted for admin approval!',
            'profile_status' => 'pending_approval',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
            ],
            'tutor' => [
                'id' => $tutor->id,
                'degree_uploaded' => !empty($degreePhotoPath),
                'subjects_count' => count($request->subjects),
                'availability_slots' => count($request->availability),
            ]
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        // Delete uploaded file if transaction fails
        if (!empty($degreePhotoPath) && Storage::disk('public')->exists($degreePhotoPath)) {
            Storage::disk('public')->delete($degreePhotoPath);
        }
        
        Log::error('Profile completion error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Profile completion failed',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Notify admin about new tutor pending approval
 */
private function notifyAdminForApproval($tutor)
{
    try {
        // Get admin users
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
        
        foreach ($admins as $admin) {
            // You can send email or notification here
            Log::info('Tutor pending approval notification', [
                'admin_id' => $admin->id,
                'admin_email' => $admin->email,
                'tutor_id' => $tutor->id,
                'tutor_name' => $tutor->user->name ?? 'Unknown',
            ]);
        }
    } catch (\Exception $e) {
        Log::error('Failed to notify admin: ' . $e->getMessage());
    }
}

}