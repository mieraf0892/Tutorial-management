<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutorial;
use App\Models\Category;
use Illuminate\Http\Request;

class TutorialController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Tutorial::with('category')
                ->where('is_published', true);

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
            if ($request->has('level') && $request->level !== 'all') {
                $query->where('level', $request->level);
            }

            $tutorials = $query->orderBy('students', 'desc')->get();

            return response()->json([
                'success' => true,
                'tutorials' => $tutorials,
                'total' => $tutorials->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tutorials',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $tutorial = Tutorial::with('category')
                ->where('is_published', true)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'tutorial' => $tutorial
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tutorial not found'
            ], 404);
        }
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
}