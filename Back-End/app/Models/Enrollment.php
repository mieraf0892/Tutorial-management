<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'tutorial_id', 'completed_at'];

    protected $casts = [
        'completed_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class);
    }

    // ✅ ADD THIS RELATIONSHIP:
    public function lessonCompletions()
    {
        return $this->hasMany(LessonCompletion::class, 'user_id', 'user_id')
                    ->where('tutorial_id', $this->tutorial_id);
    }
}