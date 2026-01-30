<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = Category::where('is_active', true)
                ->orderBy('tutorial_count', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        try {
            $category = Category::where('slug', $slug)
                ->where('is_active', true)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
    }

    /**
 * Get categories tree for admin course creation (only subcategories with full path)
 */
public function adminTree()
{
    $subcategories = Category::where('level', 1)
        ->where('is_active', true)
        ->with('parent')
        ->orderBy('name')
        ->get()
        ->map(function ($cat) {
            return [
                'id'         => $cat->id,
                'name'       => $cat->name,
                'full_path'  => $cat->full_path,        // e.g. "Programming > AI"
                'parent_id'  => $cat->parent_id,
                'parent_name'=> $cat->parent?->name,
                'slug'       => $cat->slug,
            ];
        });

    return response()->json([
        'success' => true,
        'message' => 'Subcategories for course creation',
        'subcategories' => $subcategories
    ]);
}
}