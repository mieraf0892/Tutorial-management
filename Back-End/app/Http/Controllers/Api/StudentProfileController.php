<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentProfileController extends Controller
{
    /**
     * Get student profile
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Students only.'
                ], 403);
            }

            $student = $user->student;
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Load relationships based on your actual model
            $student->load(['learningPreferences', 'courseDetails', 'user.enrollments.tutorial']);

            return response()->json([
                'success' => true,
                'profile' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                    ],
                    'student' => [
                        'id' => $student->id,
                        'father_name' => $student->father_name,
                        'age' => $student->age,
                        'parent_email' => $student->parent_email,
                        'sex' => $student->sex,
                        'country' => $student->country,
                        'phone_code' => $student->phone_code,
                        'city' => $student->city,
                        'subcity' => $student->subcity,
                        'address' => $student->address,
                        'course_type' => $student->course_type,
                        'learning_preferences' => $student->learningPreferences,
                        'course_details' => $student->courseDetails,
                    ],
                    'stats' => [
                        'total_enrolled_tutorials' => $user->enrollments->count(),
                        'completed_tutorials' => $user->enrollments->where('status', 'completed')->count(),
                        'attendance_rate' => 0,
                        'average_grade' => 0,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Student profile error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load student profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update student profile
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Students only.'
                ], 403);
            }

            $student = $user->student;
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            $validated = $request->validate([
                'father_name' => 'nullable|string|max:255',
                'age' => 'nullable|integer|min:10|max:100',
                'parent_email' => 'nullable|email|max:255',
                'sex' => 'nullable|in:male,female,other',
                'country' => 'nullable|string|max:100',
                'phone_code' => 'nullable|string|max:10',
                'city' => 'nullable|string|max:100',
                'subcity' => 'nullable|string|max:100',
                'address' => 'nullable|string|max:255',
                'course_type' => 'nullable|string|max:255',
            ]);

            $student->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'profile' => $student->fresh(['learningPreferences', 'courseDetails'])
            ]);

        } catch (\Exception $e) {
            Log::error('Update student profile error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update learning preferences
     */
    public function updateLearningPreferences(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Students only.'
                ], 403);
            }

            $student = $user->student;
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            $validated = $request->validate([
                'preferred_learning_style' => 'nullable|string|max:255',
                'difficulty_level' => 'nullable|string|max:100',
                'weekly_hours' => 'nullable|integer|min:1|max:40',
                'preferred_schedule' => 'nullable|string|max:255',
                'learning_goals' => 'nullable|string|max:1000',
                'subjects_of_interest' => 'nullable|string|max:1000',
            ]);

            // Update or create learning preferences
            if ($student->learningPreferences) {
                $student->learningPreferences->update($validated);
            } else {
                $student->learningPreferences()->create($validated);
            }

            return response()->json([
                'success' => true,
                'message' => 'Learning preferences updated successfully',
                'learning_preferences' => $student->learningPreferences->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Update learning preferences error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update learning preferences',
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
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Students only.'
                ], 403);
            }

            $request->validate([
                'photo' => 'required|image|max:2048', // 2MB max
            ]);

            $student = $user->student;
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Store the photo
            $path = $request->file('photo')->store('profile-photos', 'public');
            
            // Update user's profile photo
            $user->update([
                'profile_photo' => $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile photo updated successfully',
                'photo_url' => asset('storage/' . $path)
            ]);

        } catch (\Exception $e) {
            Log::error('Student profile photo upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload profile photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update contact information
     */
    public function updateContact(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Students only.'
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
            Log::error('Update student contact info error: ' . $e->getMessage());
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
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Students only.'
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
            Log::error('Change student password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}