<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoriesTableSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Learn frontend and backend web development',
                'icon' => 'code',
                'color' => 'blue',
                'tutorial_count' => 450,
                'is_active' => true
            ],
            [
                'name' => 'Design',
                'slug' => 'design',
                'description' => 'UI/UX design, graphic design, and creative skills',
                'icon' => 'palette',
                'color' => 'purple',
                'tutorial_count' => 320,
                'is_active' => true
            ],
            [
                'name' => 'Marketing',
                'slug' => 'marketing',
                'description' => 'Digital marketing, SEO, and growth strategies',
                'icon' => 'trending-up',
                'color' => 'orange',
                'tutorial_count' => 180,
                'is_active' => true
            ],
            [
                'name' => 'Data Science',
                'slug' => 'data-science',
                'description' => 'Data analysis, machine learning, and AI',
                'icon' => 'database',
                'color' => 'green',
                'tutorial_count' => 250,
                'is_active' => true
            ],
            [
                'name' => 'Mobile Development',
                'slug' => 'mobile-development',
                'description' => 'iOS, Android, and cross-platform app development',
                'icon' => 'smartphone',
                'color' => 'indigo',
                'tutorial_count' => 210,
                'is_active' => true
            ],
            [
                'name' => 'Programming',
                'slug' => 'programming',
                'description' => 'General programming languages and computer science',
                'icon' => 'code-2',
                'color' => 'cyan',
                'tutorial_count' => 523,
                'is_active' => true
            ],
            [
                'name' => 'Languages',
                'slug' => 'languages',
                'description' => 'Learn new languages and communication skills',
                'icon' => 'globe',
                'color' => 'emerald',
                'tutorial_count' => 287,
                'is_active' => true
            ],
            [
                'name' => 'School Subjects',
                'slug' => 'school-subjects',
                'description' => 'Academic subjects and curriculum-based learning',
                'icon' => 'graduation-cap',
                'color' => 'pink',
                'tutorial_count' => 412,
                'is_active' => true
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
