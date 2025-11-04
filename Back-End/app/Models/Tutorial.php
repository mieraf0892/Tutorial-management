<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'category_id', 'duration', 'students', 
        'rating', 'level', 'image', 'content', 'instructor', 'lessons',
        'price', 'is_published'
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'price' => 'decimal:2',
        'is_published' => 'boolean'
    ];

    // Relationship with category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship with tutor (when you have tutors creating tutorials)
    public function tutor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}