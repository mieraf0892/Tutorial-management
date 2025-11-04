<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'phone', 'age', 'sex', 'country', 'phone_code', 
        'city', 'subcity', 'address', 'bio', 'qualification', 
        'experience_years', 'hourly_rate', 'is_verified'
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with Subjects
    public function subjects()
    {
        return $this->hasMany(TutorSubject::class);
    }

    // Relationship with Availability
    public function availabilities()
    {
        return $this->hasMany(TutorAvailability::class);
    }
}