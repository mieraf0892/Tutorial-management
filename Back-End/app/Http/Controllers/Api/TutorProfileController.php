<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
}