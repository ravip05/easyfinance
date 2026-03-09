<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCourseProgress extends Model
{
    protected $table = 'user_course_progress';

    protected $fillable = [
        'user_id',
        'course_id',
        'progress_percent',
        'is_enrolled',
        'enrolled_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'progress_percent' => 'integer',
            'is_enrolled'      => 'boolean',
            'enrolled_at'      => 'datetime',
            'completed_at'     => 'datetime',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Whether the course has been completed (progress = 100).
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->progress_percent >= 100;
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Updates progress and auto-stamps completed_at when reaching 100%.
     */
    public function updateProgress(int $percent): void
    {
        $this->progress_percent = min(100, max(0, $percent));

        if ($this->progress_percent >= 100 && ! $this->completed_at) {
            $this->completed_at = now();
        }

        $this->save();
    }
}
