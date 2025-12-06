<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'age',
        'sex',
        'country',
        'phone_code',
        'city',
        'subcity',
        'address',
        'bio',
        'qualification',
        'degree_photo',
        'degree_verified',
        'experience_years',
        'hourly_rate',
        'is_verified',
        'rejection_reason',
        'profile_photo',
        'title',
        'headline',
        'education',
        'certifications',
        'teaching_style',
        'video_intro',
        'social_links',
        'response_time',
        'student_capacity',
    ];

    // Add casting for array fields
    protected $casts = [
        'social_links' => 'array',
        'certifications' => 'array',
        'degree_verified' => 'string', 
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subjects()
    {
        return $this->hasMany(TutorSubject::class);
    }

    public function availability()
    {
        return $this->hasMany(TutorAvailability::class);
    }

    // Relationship with tutorials
    public function tutorials()
    {
        return $this->hasMany(Tutorial::class, 'tutor_id');
    }

    // Accessor for profile photo URL
    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo ? asset('storage/' . $this->profile_photo) : null;
    }

    // ADD THIS: Accessor for degree photo URL
    public function getDegreePhotoUrlAttribute()
    {
        return $this->degree_photo ? asset('storage/' . $this->degree_photo) : null;
    }

    // Calculate profile completion percentage
    public function getProfileCompletionAttribute()
    {
        $fields = [
            'bio', 'qualification', 'experience_years', 'hourly_rate',
            'country', 'city', 'profile_photo', 'title', 'headline'
        ];
        
        $completed = 0;
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $completed++;
            }
        }
        
        return round(($completed / count($fields)) * 100);
    }

    // ADD THIS: Check if degree is pending
    public function isDegreePending()
    {
        return $this->degree_verified === 'pending';
    }

    // ADD THIS: Check if degree is approved
    public function isDegreeApproved()
    {
        return $this->degree_verified === 'approved';
    }

    // ADD THIS: Check if degree is rejected
    public function isDegreeRejected()
    {
        return $this->degree_verified === 'rejected';
    }
}