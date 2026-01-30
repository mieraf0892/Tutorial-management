<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'file_path',
        'original_name',
        'mime_type',
        'size_kb',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}