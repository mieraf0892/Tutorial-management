<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'slug', 
        'description', 
        'icon', 
        'color', 
        'tutorial_count', 
        'is_active',
        'parent_id',     // ← added
        'level'          // ← added
    ];

    // A category belongs to one parent (if it's a subcategory)
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // A category can have many children (subcategories)
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')
                    ->orderBy('name');
    }

    // Helper: returns full path like "Programming > AI"
    public function getFullPathAttribute()
    {
        $path = [$this->name];
        $current = $this;

        while ($current->parent) {
            $path[] = $current->parent->name;
            $current = $current->parent;
        }

        return implode(' > ', array_reverse($path));
    }

    // Keep your existing relationship (if you still use tutorials)
    public function tutorials()
    {
        return $this->hasMany(Tutorial::class);
    }

    // Optional: relationship to courses (we'll use this soon)
    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}