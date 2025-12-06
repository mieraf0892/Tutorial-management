<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class AnnouncementTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'message',
        'suggested_target_type',
        'suggested_priority',
        'usage_count',
        'created_by',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    /**
     * Get the admin who created this template
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all usage records for this template
     */
    public function usageRecords(): HasMany
    {
        return $this->hasMany(TemplateUsage::class, 'template_id');
    }

    /**
     * Increment usage count and record usage
     */
    public function recordUsage(int $adminId): void
    {
        try {
            // Increment usage count
            $this->increment('usage_count');
            
            // Create usage record
            TemplateUsage::create([
                'template_id' => $this->id,
                'admin_id' => $adminId,
                'used_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to record template usage', [
                'template_id' => $this->id,
                'admin_id' => $adminId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Scope for most frequently used templates
     */
    public function scopeMostUsed($query, $limit = 10)
    {
        return $query->orderBy('usage_count', 'desc')->limit($limit);
    }
}