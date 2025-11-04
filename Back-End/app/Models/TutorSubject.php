<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TutorSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id', 'subject_name', 'specialization', 'level'
    ];

    public function tutor()
    {
        return $this->belongsTo(Tutor::class);
    }
}