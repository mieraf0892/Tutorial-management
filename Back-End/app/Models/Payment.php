<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    // 1. Tell Laravel which columns can be filled
    protected $fillable = [
        'user_id',
        'transaction_reference',
        'amount',
        'currency',
        'status',
        'checkout_url',
        'description',
        'payment_method'
    ];

    // 2. Create a relationship to the User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}