<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCourseDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'field_type', 'field_value'
    ];

    // Relationship with Student
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}