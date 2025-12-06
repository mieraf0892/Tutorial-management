<?php
// app/Http/Controllers/Api/TutorialSessionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TutorialSession;
use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TutorialSessionController extends Controller
{
    /**
     * Get sessions for a tutorial
     */
    public function index($tutorialId)
    {
        try {
            $user = Auth::user();
            $tutorial = Tutorial::findOrFail($tutorialId);

            // Check if user has access to this tutorial
            if ($user->role === 'student') {
                $isEnrolled = $tutorial->enrollments()->where('user_id', $user->id)->exists();
                if (!$isEnrolled) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You are not enrolled in this tutorial'
                    ], 403);
                }
            } elseif ($user->role === 'tutor') {
                if ($tutorial->tutor_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to view sessions for this tutorial'
                    ], 403);
                }
            }

            $sessions = TutorialSession::where('tutorial_id', $tutorialId)
                ->orderBy('start_time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'sessions' => $sessions
            ]);

        } catch (\Exception $e) {
            Log::error('Get tutorial sessions error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tutorial sessions'
            ], 500);
        }
    }

    /**
     * Create a new session
     */
    public function store(Request $request, $tutorialId)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only tutors can create sessions'
                ], 403);
            }

            $tutorial = Tutorial::where('tutor_id', $user->id)
                ->findOrFail($tutorialId);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'start_time' => 'required|date|after:now',
                'end_time' => 'required|date|after:start_time',
                'meeting_link' => 'nullable|url',
                'session_type' => 'required|in:regular,makeup,extra',
                'duration_minutes' => 'required|integer|min:1',
                'notes' => 'nullable|string'
            ]);

            $session = TutorialSession::create([
                'tutorial_id' => $tutorialId,
                'tutor_id' => $user->id,
                ...$validated
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Session created successfully',
                'session' => $session
            ], 201);

        } catch (\Exception $e) {
            Log::error('Create session error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a session
     */
    public function update(Request $request, $sessionId)
    {
        try {
            $user = Auth::user();
            $session = TutorialSession::findOrFail($sessionId);

            if ($session->tutor_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this session'
                ], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'start_time' => 'sometimes|date',
                'end_time' => 'sometimes|date|after:start_time',
                'meeting_link' => 'nullable|url',
                'status' => 'sometimes|in:scheduled,completed,cancelled',
                'session_type' => 'sometimes|in:regular,makeup,extra',
                'duration_minutes' => 'sometimes|integer|min:1',
                'notes' => 'nullable|string'
            ]);

            $session->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Session updated successfully',
                'session' => $session
            ]);

        } catch (\Exception $e) {
            Log::error('Update session error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update session'
            ], 500);
        }
    }

    /**
     * Delete a session
     */
    public function destroy($sessionId)
    {
        try {
            $user = Auth::user();
            $session = TutorialSession::findOrFail($sessionId);

            if ($session->tutor_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this session'
                ], 403);
            }

            $session->delete();

            return response()->json([
                'success' => true,
                'message' => 'Session deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Delete session error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete session'
            ], 500);
        }
    }
}