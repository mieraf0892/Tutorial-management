<?php
// app/Models/Tutorial.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',              // NEW FIELD
        'title',
        'description',
        'category_id',
        'duration',
        'students',
        'rating',
        'level',
        'image',
        'content',
        'instructor',
        'lessons',
        'price',
        'is_published',
        'instructor_bio',
        'instructor_experience',
        'learning_objectives',
        'includes'
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'price' => 'decimal:2',
        'is_published' => 'boolean',
        'learning_objectives' => 'array',
        'includes' => 'array'
    ];

    // Relationship with tutor (NEW)
    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    // Relationship with category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship with lessons
    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    // Relationship with enrollments
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    
    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'tutorial_id', 'user_id')
                    ->where('users.role', 'student')
                    ->withPivot('status', 'completed_at');
    }

    // Get total lessons count (REAL COUNT)
    public function getTotalLessonsAttribute()
    {
        return $this->lessons()->count();
    }

    // Get real students count (REAL COUNT)
    public function getRealStudentsCountAttribute()
    {
        return $this->enrollments()->count();
    }

    // Calculate total duration from lessons (REAL DURATION)
    public function getCalculatedDurationAttribute()
    {
        return $this->duration;
    }

    // Calculate average rating from reviews (REAL RATING)
    public function getCalculatedRatingAttribute()
    {
        return $this->rating;
    }
}
