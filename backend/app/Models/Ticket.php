<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    // valid ticket statuses - used for validation and state machine transitions
    const STATUSES = ['Open', 'In Progress', 'Awaiting Reply', 'Resolved', 'Closed'];

    // allowed transitions: from_status => [to_statuses]
    const TRANSITIONS = [
        'Open'           => ['In Progress', 'Closed'],
        'In Progress'    => ['Awaiting Reply', 'Resolved', 'Closed'],
        'Awaiting Reply' => ['In Progress', 'Resolved', 'Closed'],
        'Resolved'       => ['In Progress', 'Closed'],
        'Closed'         => ['In Progress'],
    ];

    protected $fillable = [
        'user_id',
        'assigned_to',
        'subject',
        'description',
        'priority',
        'status',
        'category',
    ];

    // rbac scoping for tickets based on the five tier role system
    public function scopeForUser($query, User $user)
    {
        return match ($user->role) {
            'admin'   => $query,
            'manager' => $query->where(function ($q) use ($user) {
                             $q->where('user_id', $user->id)
                               ->orWhere('assigned_to', $user->id)
                               ->orWhereIn('user_id', $user->teamMembers()->pluck('id'));
                         }),
            'staff', 'dsa', 'client' => $query->where('user_id', $user->id),
            default   => $query->whereRaw('1 = 0'),
        };
    }

    // check if a status transition is valid according to the state machine
    public function canTransitionTo(string $newStatus): bool
    {
        return in_array($newStatus, self::TRANSITIONS[$this->status] ?? []);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // all replies flat for backwards compatibility
    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class);
    }

    // only root level replies with recursive children for threaded display
    public function threadedReplies(): HasMany
    {
        return $this->hasMany(TicketReply::class)
            ->whereNull('parent_id')
            ->with('childrenRecursive', 'user:id,name,role')
            ->orderBy('created_at');
    }

    // immutable status change audit trail
    public function statusLogs(): HasMany
    {
        return $this->hasMany(TicketStatusLog::class)->orderBy('created_at', 'desc');
    }
}
