<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'emp_code',
        'name',
        'email',
        'password',
        'role',
        'department',
        'phone',
        'status',
        'joining_date',
        'commission_rate',
        'team_leader_id',
        'franchise_id',
    ];

    // ── Hidden (never serialized to JSON) ─────────────────────────────────────
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'joining_date'      => 'date',
            'commission_rate'   => 'decimal:4',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Derives the two-letter avatar initials from the name.
     * "Priya Singh" → "PS"
     */
    public function getInitialsAttribute(): string
    {
        return collect(explode(' ', $this->name))
            ->map(fn($word) => strtoupper($word[0] ?? ''))
            ->take(2)
            ->implode('');
    }

    /**
     * Returns the commission rate as a display string.
     * 0.0025 → "0.25%"
     */
    public function getCommissionRateDisplayAttribute(): string
    {
        if (! $this->commission_rate) {
            return '—';
        }
        return number_format($this->commission_rate * 100, 2) . '%';
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Limit query to internal employees only (exclude DSA partners).
     */
    public function scopeInternal($query)
    {
        return $query->whereIn('role', ['admin', 'manager', 'staff']);
    }

    /**
     * Limit query to active employees.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Self-referential: a staff member's direct manager.
     * Staff → Manager; Manager → Admin.
     */
    public function teamLeader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'team_leader_id');
    }

    /**
     * Self-referential: all users reporting to this user.
     * Admin → [all managers]; Manager → [their staff].
     */
    public function teamMembers(): HasMany
    {
        return $this->hasMany(User::class, 'team_leader_id');
    }

    /**
     * The franchise this DSA user belongs to.
     * Only populated when role = 'dsa'.
     */
    public function franchise(): BelongsTo
    {
        return $this->belongsTo(Franchise::class);
    }

    /**
     * All leads currently assigned to this user.
     */
    public function assignedLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'assigned_to');
    }

    /**
     * All leads this user created / imported.
     */
    public function addedLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'added_by');
    }

    /**
     * All clients managed by this user.
     */
    public function managedClients(): HasMany
    {
        return $this->hasMany(Client::class, 'managed_by');
    }

    /**
     * Payouts issued to this user.
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    /**
     * Announcements created by this user.
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'created_by');
    }

    /**
     * Announcements this user has read (via pivot).
     */
    public function readAnnouncements()
    {
        return $this->belongsToMany(Announcement::class, 'announcement_reads')
                    ->withPivot('read_at')
                    ->withTimestamps();
    }

    /**
     * Courses this user is enrolled in (via pivot).
     */
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'user_course_progress')
                    ->withPivot(['progress_percent', 'is_enrolled', 'enrolled_at', 'completed_at'])
                    ->withTimestamps();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Returns true if this user can see the given lead,
     * based on the role-scoping rules from the prototype.
     */
    public function canAccessLead(Lead $lead): bool
    {
        return match ($this->role) {
            'admin'   => true,
            'manager' => $lead->assigned_to === $this->id
                         || $this->teamMembers()->pluck('id')->contains($lead->assigned_to),
            'staff'   => $lead->assigned_to === $this->id,
            'dsa'     => $lead->franchise_id === $this->franchise_id,
            default   => false,
        };
    }
}
