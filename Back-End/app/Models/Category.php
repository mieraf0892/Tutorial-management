<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'icon', 'color', 'tutorial_count', 'is_active'
    ];

    // Relationship with tutorials (when you have tutorials table)
    public function tutorials()
    {
        return $this->hasMany(Tutorial::class);
    }
}