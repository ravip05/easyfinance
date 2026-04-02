<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property int|null $assigned_to
 * @property int $assigned_by
 * @property string $priority
 * @property string $status
 * @property \Carbon\Carbon|null $due_date
 * @property \Carbon\Carbon|null $completed_at
 * @property string|null $category
 * @property-read bool $is_overdue
 */
class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'assigned_to', 'assigned_by',
        'priority', 'status', 'due_date', 'completed_at', 'category',
    ];

    protected function casts(): array
    {
        return [
            'due_date'     => 'date',
            'completed_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Role-based visibility — same pattern as Lead::forUser()
     */
    public function scopeForUser($query, User $user)
    {
        return match ($user->role) {
            'admin'   => $query,
            'manager' => $query->where(function ($q) use ($user) {
                $teamIds = $user->teamMembers()->pluck('id')->push($user->id);
                $q->whereIn('assigned_to', $teamIds)
                  ->orWhere('assigned_by', $user->id);
            }),
            default => $query->where('assigned_to', $user->id),
        };
    }

    // ── Accessors ────────────────────────────────────────────────────────────

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date
            && $this->due_date->isPast()
            && !in_array($this->status, ['Completed', 'Cancelled']);
    }
}
