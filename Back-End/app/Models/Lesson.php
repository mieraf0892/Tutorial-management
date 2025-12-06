<?php
// app/Models/Lesson.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutorial_id', 'title', 'description', 'duration', 'order',
        'video_url', 'content', 'is_preview', 'is_locked'
    ];

    protected $casts = [
        'is_preview' => 'boolean',
        'is_locked' => 'boolean'
    ];

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class);
    }

    public function completions()
    {
        return $this->hasMany(LessonCompletion::class);
    }
}