<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'father_name', 'age', 'parent_email', 'sex', 
        'country', 'phone_code', 'city', 'subcity', 'address', 'course_type'
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with Learning Preferences
    public function learningPreference()
    {
        return $this->hasOne(StudentLearningPreference::class);
    }

    // Relationship with Course Details
    public function courseDetails()
    {
        return $this->hasMany(StudentCourseDetail::class);
    }
}