<?php
// database/seeders/CategoriesTableSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesTableSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Programming',
                'slug' => 'programming',
                'color' => '#3b82f6', // blue-500
                'description' => 'Programming and coding courses',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'School Grades',
                'slug' => 'school-grades',
                'color' => '#10b981', // green-500
                'description' => 'School curriculum and grade-level courses',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Languages',
                'slug' => 'languages',
                'color' => '#8b5cf6', // purple-500
                'description' => 'Language learning courses',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Entrance Exam Preparations',
                'slug' => 'entrance-exams',
                'color' => '#f59e0b', // amber-500
                'description' => 'Preparation for entrance exams',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('categories')->insert($categories);
    }
}