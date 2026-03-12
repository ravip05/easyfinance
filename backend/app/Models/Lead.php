<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'name',
        'phone',
        'email',
        'pan_number',
        'birth_date',
        'location',
        'loan_type',
        'amount',
        'monthly_income',
        'income_status',
        'running_loans',
        'previous_issues',
        'cibil_score',
        'lead_value',
        'stage',
        'priority',
        'source',
        'follow_up_date',
        'follow_up_time',
        'notes',
        'assigned_to',
        'added_by',
        'franchise_id',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'amount'          => 'decimal:2',
            'monthly_income'  => 'decimal:2',
            'lead_value'      => 'decimal:2',
            'follow_up_date'  => 'date',
            'birth_date'      => 'date',
            'cibil_score'     => 'integer',
            'running_loans'   => 'integer',
        ];
    }

    // ── Constants ─────────────────────────────────────────────────────────────

    const STAGES = [
        'New', 'Contacted', 'Docs Pending', 'Docs Received',
        'CIBIL', 'Login', 'Processing', 'Sanctioned', 'Disbursed', 'Closed',
    ];

    const LOAN_TYPES = [
        'Home Loan', 'Business Loan', 'Personal Loan',
        'Car Loan', 'LAP', 'Insurance',
    ];

    const SOURCES = [
        'Direct', 'Website', 'Referral', 'DSA Partner', 'Social Media', 'Walk-in',
    ];

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Formatted Indian-style amount string for display.
     * 4500000 → "₹45L"
     * 10000000 → "₹1Cr"
     */
    public function getAmountFormattedAttribute(): string
    {
        if (! $this->amount) {
            return 'TBD';
        }

        $amt = (float) $this->amount;

        if ($amt >= 10_000_000) {
            return '₹' . number_format($amt / 10_000_000, 1) . 'Cr';
        }
        if ($amt >= 100_000) {
            return '₹' . number_format($amt / 100_000, 0) . 'L';
        }

        return '₹' . number_format($amt, 0, '.', ',');
    }

    /**
     * Two-letter initials from the applicant's name.
     */
    public function getInitialsAttribute(): string
    {
        return collect(explode(' ', $this->name))
            ->map(fn($w) => strtoupper($w[0] ?? ''))
            ->take(2)
            ->implode('');
    }

    /**
     * Whether this lead is overdue (follow_up_date is in the past).
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->follow_up_date
            && $this->follow_up_date->isPast()
            && ! in_array($this->stage, ['Disbursed', 'Closed']);
    }

    /**
     * Auto-calculated age from birth_date
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date?->age;
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Role-based visibility scope — the single source of truth for what
     * leads a given user is allowed to see. Mirrors scopedLeads() from the
     * prototype but enforced at the query level.
     *
     * Usage: Lead::forUser($user)->get()
     */
    public function scopeForUser($query, User $user)
    {
        return match ($user->role) {
            'admin'   => $query,                                        // sees all
            'manager' => $query->where(function ($q) use ($user) {
                              $teamIds = $user->teamMembers()->pluck('id')
                                              ->push($user->id);
                              $q->whereIn('assigned_to', $teamIds);
                         }),
            'staff'   => $query->where('assigned_to', $user->id),
            'dsa'     => $query->where('franchise_id', $user->franchise_id),
            'client'  => $query->where('phone', $user->phone),          // clients see own applications
            default   => $query->whereRaw('1 = 0'),                     // no access
        };
    }

    /**
     * Filter leads that need follow-up today.
     */
    public function scopeFollowUpToday($query)
    {
        return $query->whereDate('follow_up_date', today());
    }

    /**
     * Filter overdue leads (past follow-up, not yet disbursed/closed).
     */
    public function scopeOverdue($query)
    {
        return $query->whereDate('follow_up_date', '<', today())
                     ->whereNotIn('stage', ['Disbursed', 'Closed']);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The staff member currently working this lead.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The user who originally created / imported this lead.
     */
    public function addedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * The franchise that sourced this lead (null for direct leads).
     */
    public function franchise(): BelongsTo
    {
        return $this->belongsTo(Franchise::class);
    }

    /**
     * The client record created when this lead was converted.
     * A lead can only convert to one client.
     */
    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }
}
