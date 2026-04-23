<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'start_date',
        'end_date',
        'reason',
        'status',
        'approved_by',
        'rejection_note',
        'actioned_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date'  => 'date',
            'end_date'    => 'date',
            'actioned_at' => 'datetime',
        ];
    }

    // ── Scopes ──

    /**
     * Scope leaves visible to a given user based on role.
     * Admin: all leaves. Manager: own + team. Staff: own only.
     */
    public function scopeForUser($query, User $user)
    {
        return match ($user->role) {
            'admin'   => $query,
            'manager' => $query->where(function ($q) use ($user) {
                             $q->where('user_id', $user->id)
                               ->orWhereIn('user_id', $user->teamMembers()->pluck('id'));
                         }),
            default   => $query->where('user_id', $user->id),
        };
    }

    /**
     * Leaves that are currently active (approved and overlapping today).
     */
    public function scopeActiveToday($query)
    {
        $today = now()->toDateString();
        return $query->where('status', 'Approved')
                     ->where('start_date', '<=', $today)
                     ->where('end_date', '>=', $today);
    }

    // ── Relationships ──

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ── Accessors ──

    public function getDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}
