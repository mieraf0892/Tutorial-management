<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'father_name', 'age', 'parent_email', 'sex', 
        'country', 'phone_code', 'city', 'subcity', 'address', 'course_type','is_paid', 'final_price',
        'learning_preference', // 'individual' or 'group'
        'preferred_days',
        'preferred_hours_per_day',
        'course_interests',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function learningPreferences()
    {
        return $this->hasOne(StudentLearningPreference::class);
    }

    public function courseDetails()
    {
        return $this->hasMany(StudentCourseDetail::class);
    }
}