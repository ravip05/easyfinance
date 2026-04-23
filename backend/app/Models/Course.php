<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'title',
        'thumbnail_emoji',
        'color_bg',
        'category',
        'level',
        'total_lessons',
        'duration_minutes',
        'is_published',
        'sort_order',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'is_published'     => 'boolean',
            'total_lessons'    => 'integer',
            'duration_minutes' => 'integer',
            'sort_order'       => 'integer',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Converts stored minutes back to the display format used in the prototype.
     * 135 → "2h 15m"
     * 90  → "1h 30m"
     * 45  → "45m"
     */
    public function getDurationDisplayAttribute(): string
    {
        $minutes = $this->duration_minutes;
        $hours   = intdiv($minutes, 60);
        $mins    = $minutes % 60;

        if ($hours > 0 && $mins > 0) {
            return "{$hours}h {$mins}m";
        }
        if ($hours > 0) {
            return "{$hours}h";
        }

        return "{$mins}m";
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByLevel($query, string $level)
    {
        return $query->where('level', $level);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * All users enrolled in this course (via pivot).
     */
    public function enrolledUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_course_progress')
                    ->withPivot(['progress_percent', 'is_enrolled', 'enrolled_at', 'completed_at'])
                    ->wherePivot('is_enrolled', true)
                    ->withTimestamps();
    }

    /**
     * All progress rows for this course.
     */
    public function progressRecords(): HasMany
    {
        return $this->hasMany(UserCourseProgress::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Returns the progress record for a specific user, or null.
     */
    public function progressFor(User $user): ?UserCourseProgress
    {
        return $this->progressRecords()
                    ->where('user_id', $user->id)
                    ->first();
    }
}
