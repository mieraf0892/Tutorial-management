<?php

namespace Database\Seeders;

use App\Models\Tutorial;
use App\Models\Category;
use Illuminate\Database\Seeder;

class TutorialsTableSeeder extends Seeder
{
    public function run()
    {
        // Get categories
        $webDev = Category::where('slug', 'web-development')->first();
        $design = Category::where('slug', 'design')->first();
        $marketing = Category::where('slug', 'marketing')->first();
        $dataScience = Category::where('slug', 'data-science')->first();
        $programming = Category::where('slug', 'programming')->first();

        $tutorials = [
            [
                'title' => 'Modern React Development',
                'description' => 'Learn React 18 with hooks, context, and modern best practices for building scalable applications.',
                'category_id' => $webDev->id,
                'duration' => '8h 30m',
                'students' => 12450,
                'rating' => 4.8,
                'level' => 'Intermediate',
                'image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
                'instructor' => 'Sarah Johnson',
                'lessons' => 45,
                'price' => 49.99,
                'is_published' => true
            ],
            [
                'title' => 'UI/UX Design Fundamentals',
                'description' => 'Master the principles of user interface and user experience design with real-world projects.',
                'category_id' => $design->id,
                'duration' => '6h 15m',
                'students' => 8920,
                'rating' => 4.9,
                'level' => 'Beginner',
                'image' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
                'instructor' => 'Michael Chen',
                'lessons' => 32,
                'price' => 39.99,
                'is_published' => true
            ],
            [
                'title' => 'Python for Data Science',
                'description' => 'Comprehensive guide to data analysis, visualization, and machine learning with Python.',
                'category_id' => $dataScience->id,
                'duration' => '12h 45m',
                'students' => 15670,
                'rating' => 4.7,
                'level' => 'Advanced',
                'image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
                'instructor' => 'Dr. Emily Watson',
                'lessons' => 68,
                'price' => 59.99,
                'is_published' => true
            ],
            // Add more tutorials following the same pattern...
        ];

        foreach ($tutorials as $tutorial) {
            Tutorial::create($tutorial);
        }
    }
}