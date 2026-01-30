<?php
// app/Models/Course.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'category',
        'subcategory',
        'duration_hours',
        'price_group',
        'price_individual',
        'is_active',
        'curriculum',
        'learning_outcomes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'curriculum' => 'array',
        'learning_outcomes' => 'array',
        'price_group' => 'decimal:2',
        'price_individual' => 'decimal:2',
    ];

    // Category constants for easy reference
    const CATEGORY_PROGRAMMING = 'programming';
    const CATEGORY_SCHOOL_GRADES = 'school-grades';
    const CATEGORY_LANGUAGES = 'languages';
    const CATEGORY_ENTRANCE_EXAMS = 'entrance-exams';

    public static function getCategories()
    {
        return [
            self::CATEGORY_PROGRAMMING => 'Programming',
            self::CATEGORY_SCHOOL_GRADES => 'School Grades',
            self::CATEGORY_LANGUAGES => 'Languages',
            self::CATEGORY_ENTRANCE_EXAMS => 'Entrance Exam Preparations',
        ];
    }

    // Relationship: A course can have many classes
    public function classes()
    {
        return $this->hasMany(ClassRoom::class, 'course_id'); // We'll create this later
    }

    // Scope for active courses
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for category
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function tutorials()
    {
        return $this->hasMany(Tutorial::class, 'course_id');
    }
    
    public function tutors()
    {
        return $this->belongsToMany(User::class, 'course_tutor', 'course_id', 'tutor_id')
                ->withTimestamps()
                ->select('users.id', 'users.name', 'users.email'); // Select only necessary fields
    }
}