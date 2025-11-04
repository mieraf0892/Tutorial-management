<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentLearningPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'learning_mode', 'learning_preference', 
        'study_days', 'hours_per_day'
    ];

    protected $casts = [
        'study_days' => 'array'
    ];

    // Relationship with Student
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}