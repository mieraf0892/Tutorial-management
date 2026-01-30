<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutorial;
use App\Models\Category;
use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TutorialController extends Controller
{
    public function index(Request $request)
{
    try {
        // Start with base query
        $query = Tutorial::with(['category', 'tutor'])
            ->where('status', 'published');

        // Search filter
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('instructor', 'like', "%{$searchTerm}%");
            });
        }

        // Category filter
        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('name', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Level filter
        if ($request->has('level') && $request.level !== 'all') {
            $query->where('level', $request->level);
        }

        // Order and get results - FIXED LINE
        $tutorials = $query->orderBy('enrollment_count', 'desc')->get();

        // Add preview information for each tutorial
        $tutorials = $tutorials->map(function($tutorial) {
            $tutorialData = $tutorial->toArray();
            
            // For public listing, show limited information
            $tutorialData['has_preview'] = $tutorial->has_preview ?? true;
            $tutorialData['preview_description'] = $tutorial->preview_description ?? 
                substr($tutorial->description, 0, 150) . '...';
            $tutorialData['preview_lessons_count'] = $tutorial->preview_lessons_count ?? 2;
            
            // Remove full lessons from listing
            unset($tutorialData['lessons']);
            
            return $tutorialData;
        });

        return response()->json([
            'success' => true,
            'tutorials' => $tutorials,
            'total' => $tutorials->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Tutorial index error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch tutorials',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function show($id)
{
    $tutorial = Tutorial::with([
        'lessons' => fn($q) => $q->orderBy('order')
    ])->findOrFail($id);

    return response()->json([
        'success' => true,
        'tutorial' => $tutorial
    ]);
}

    public function getCategories()
    {
        try {
            $categories = Category::where('is_active', true)->get();

            return response()->json([
                'success' => true,
                'categories' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }

    public function getLevels()
    {
        return response()->json([
            'success' => true,
            'levels' => ['Beginner', 'Intermediate', 'Advanced']
        ]);
    }

    public function enroll(Request $request, $id)
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $tutorial = Tutorial::findOrFail($id);

        // Check if already enrolled
        if ($user->enrollments()->where('tutorial_id', $id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Already enrolled in this tutorial'
            ], 400);
        }

        // Check if tutorial is free
        if ($tutorial->is_free ?? false) {
            return response()->json([
                'success' => false,
                'message' => 'This is a free tutorial. No enrollment needed.'
            ], 400);
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'tutorial_id' => $id,
            'enrolled_at' => now(),
        ]);

        // FIX: Increment enrollment_count instead of students
        $tutorial->increment('enrollment_count');

        return response()->json([
            'success' => true,
            'message' => 'Successfully enrolled in tutorial'
        ]);

    } catch (\Exception $e) {
        Log::error('Enrollment error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to enroll in tutorial'
        ], 500);
    }
}

    // Check enrollment status
    public function checkEnrollment($id)
    {
        try {
            $user = Auth::user();
            $isEnrolled = false;
            $hasAccess = false;

            if ($user) {
                $tutorial = Tutorial::find($id);
                if ($tutorial) {
                    $isEnrolled = $user->enrollments()->where('tutorial_id', $id)->exists();
                    $hasAccess = $isEnrolled || ($tutorial->is_free ?? false) || 
                                in_array($user->role, ['tutor', 'admin', 'super_admin']);
                }
            }

            return response()->json([
                'success' => true,
                'is_enrolled' => $isEnrolled,
                'has_access' => $hasAccess
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check enrollment status'
            ], 500);
        }
    }
}