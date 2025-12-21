<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LessonController extends Controller
{
    /**
     * Show lesson details
     */
    public function show($tutorialId, $lessonId)
    {
        try {
            $user = Auth::user();
            $tutorial = Tutorial::findOrFail($tutorialId);

            // -----------------------------
            // Determine access level
            // -----------------------------
            $isAdminOrTutor = in_array($user->role, ['tutor', 'admin', 'super_admin']);

            $isEnrolled = $user->enrollments()
                ->where('tutorial_id', $tutorialId)
                ->exists();

            $hasTutorialAccess = $isAdminOrTutor || $isEnrolled || $tutorial->is_free;

            if (!$hasTutorialAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this tutorial'
                ], 403);
            }

            // -----------------------------
            // Get lesson
            // -----------------------------
            $lesson = Lesson::where('tutorial_id', $tutorialId)
                ->where('id', $lessonId)
                ->firstOrFail();

            // -----------------------------
            // Check lesson accessibility
            // -----------------------------
            if (!$this->checkLessonAccess($lesson, $user, $tutorialId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This lesson is locked'
                ], 403);
            }

            // -----------------------------
            // Completion status
            // -----------------------------
            $isCompleted = LessonCompletion::where('user_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->exists();

            // -----------------------------
            // Navigation
            // -----------------------------
            $nextLesson = Lesson::where('tutorial_id', $tutorialId)
                ->where('order', '>', $lesson->order)
                ->orderBy('order')
                ->first();

            $previousLesson = Lesson::where('tutorial_id', $tutorialId)
                ->where('order', '<', $lesson->order)
                ->orderBy('order', 'desc')
                ->first();

            // -----------------------------
            // Sidebar lessons
            // -----------------------------
            $sidebarLessons = Lesson::where('tutorial_id', $tutorialId)
                ->orderBy('order')
                ->get()
                ->map(function ($lessonItem) use ($user, $tutorialId) {
                    return [
                        'id' => $lessonItem->id,
                        'title' => $lessonItem->title,
                        'order' => $lessonItem->order,
                        'duration' => $lessonItem->duration,
                        'is_preview' => $lessonItem->is_preview,
                        'is_locked' => $lessonItem->is_locked,
                        'is_completed' => LessonCompletion::where('user_id', $user->id)
                            ->where('lesson_id', $lessonItem->id)
                            ->exists(),
                        'is_accessible' => $this->checkLessonAccess($lessonItem, $user, $tutorialId),
                    ];
                });

            // -----------------------------
            // Progress
            // -----------------------------
            $completedLessons = LessonCompletion::where('user_id', $user->id)
                ->where('tutorial_id', $tutorialId)
                ->count();

            $totalLessons = Lesson::where('tutorial_id', $tutorialId)->count();

            return response()->json([
                'success' => true,
                'lesson' => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'description' => $lesson->description,
                    'duration' => $lesson->duration,
                    'order' => $lesson->order,
                    'video_url' => $lesson->video_url,
                    'content' => $lesson->content,
                    'is_preview' => $lesson->is_preview,
                    'is_locked' => $lesson->is_locked,
                    'is_completed' => $isCompleted,
                    'created_at' => $lesson->created_at,
                    'updated_at' => $lesson->updated_at,
                ],
                'is_accessible' => true,
                'tutorial' => [
                    'id' => $tutorial->id,
                    'title' => $tutorial->title,
                    'instructor' => $tutorial->instructor,
                    'category' => $tutorial->category,
                ],
                'navigation' => [
                    'next_lesson' => $nextLesson ? [
                        'id' => $nextLesson->id,
                        'title' => $nextLesson->title,
                        'order' => $nextLesson->order,
                        'is_accessible' => $this->checkLessonAccess($nextLesson, $user, $tutorialId),
                    ] : null,
                    'previous_lesson' => $previousLesson ? [
                        'id' => $previousLesson->id,
                        'title' => $previousLesson->title,
                        'order' => $previousLesson->order,
                        'is_accessible' => $this->checkLessonAccess($previousLesson, $user, $tutorialId),
                    ] : null,
                ],
                'sidebar_lessons' => $sidebarLessons,
                'progress' => [
                    'completed_lessons' => $completedLessons,
                    'total_lessons' => $totalLessons,
                    'percentage' => $totalLessons > 0
                        ? round(($completedLessons / $totalLessons) * 100, 2)
                        : 0,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Lesson show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch lesson'
            ], 500);
        }
    }

    /**
     * Mark lesson as completed
     */
    public function complete(Request $request, $lessonId)
    {
        try {
            $user = Auth::user();
            $lesson = Lesson::findOrFail($lessonId);

            LessonCompletion::firstOrCreate([
                'user_id' => $user->id,
                'lesson_id' => $lessonId,
                'tutorial_id' => $lesson->tutorial_id,
            ], [
                'completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lesson marked as completed'
            ]);

        } catch (\Exception $e) {
            Log::error('Lesson completion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark lesson as completed'
            ], 500);
        }
    }

    /**
     * Lesson access rules (SINGLE SOURCE OF TRUTH)
     */
    private function checkLessonAccess($lesson, $user, $tutorialId)
    {
        // Admins & tutors
        if (in_array($user->role, ['tutor', 'admin', 'super_admin'])) {
            return true;
        }

        // Enrolled students → FULL ACCESS
        $isEnrolled = $user->enrollments()
            ->where('tutorial_id', $tutorialId)
            ->exists();

        if ($isEnrolled) {
            return true;
        }

        // Preview lessons
        if ($lesson->is_preview) {
            return true;
        }

        return false;
    }
}
