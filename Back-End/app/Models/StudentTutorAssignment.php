<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTutorAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'tutor_id',
        'student_id',
        'class_id',
        'status',
        'start_date',
        'end_date',
        'weekly_hours'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Add relationship
public function class()
{
    return $this->belongsTo(ClassRoom::class, 'class_id');
}

// Add scope for unassigned assignments
public function scopeUnassigned($query)
{
    return $query->whereNull('class_id');
}

public function scopeAssignedToClass($query, $classId)
{
    return $query->where('class_id', $classId);
}
}