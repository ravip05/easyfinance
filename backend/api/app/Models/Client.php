<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'lead_id',
        'name',
        'phone',
        'email',
        'pan_number',
        'aadhaar_number',
        'loan_type',
        'amount',
        'monthly_income',
        'emi_amount',
        'tenure_months',
        'disbursed_at',
        'cibil_score',
        'stage',
        'bank_policy_id',
        'bank_reference_number',
        'notes',
        'managed_by',
        'franchise_id',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'amount'         => 'decimal:2',
            'monthly_income' => 'decimal:2',
            'emi_amount'     => 'decimal:2',
            'disbursed_at'   => 'date',
        ];
    }

    // ── Constants ─────────────────────────────────────────────────────────────

    const STAGES = [
        'New', 'Docs Pending', 'Login', 'Processing', 'Sanctioned', 'Disbursed',
    ];

    const CIBIL_EXCELLENT = 750;
    const CIBIL_GOOD      = 650;

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Formatted amount string for display (same logic as Lead).
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
     * Two-letter initials.
     */
    public function getInitialsAttribute(): string
    {
        return collect(explode(' ', $this->name))
            ->map(fn($w) => strtoupper($w[0] ?? ''))
            ->take(2)
            ->implode('');
    }

    /**
     * CIBIL score category for colour-coding in the UI.
     * Mirrors the prototype: green ≥ 750, cyan ≥ 650, red < 650.
     */
    public function getCibilCategoryAttribute(): string
    {
        if (! $this->cibil_score) {
            return 'unknown';
        }

        return match (true) {
            $this->cibil_score >= self::CIBIL_EXCELLENT => 'excellent',
            $this->cibil_score >= self::CIBIL_GOOD      => 'good',
            default                                      => 'poor',
        };
    }

    /**
     * Calculated monthly EMI using standard reducing-balance formula.
     * Returns null if insufficient data.
     * Used when emi_amount is not yet set (quote stage).
     */
    public function getCalculatedEmiAttribute(): ?float
    {
        if (! $this->amount || ! $this->tenure_months) {
            return null;
        }

        // Assume a default rate of 9% if no bank policy attached
        $annualRate = $this->bankPolicy?->hl_interest_rate
            ? (float) $this->bankPolicy->hl_interest_rate / 100
            : 0.09;

        $r = $annualRate / 12;
        $n = $this->tenure_months;
        $p = (float) $this->amount;

        if ($r === 0.0) {
            return $p / $n;
        }

        return round($p * $r * pow(1 + $r, $n) / (pow(1 + $r, $n) - 1), 2);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Role-based visibility scope for clients.
     * Same rules as leads: manager sees own + team, staff sees own only.
     */
    public function scopeForUser($query, User $user)
    {
        return match ($user->role) {
            'admin'   => $query,
            'manager' => $query->where(function ($q) use ($user) {
                              $teamIds = $user->teamMembers()->pluck('id')
                                              ->push($user->id);
                              $q->whereIn('managed_by', $teamIds);
                         }),
            'staff'   => $query->where('managed_by', $user->id),
            'dsa'     => $query->where('franchise_id', $user->franchise_id),
            default   => $query->whereRaw('1 = 0'),
        };
    }

    public function scopeDisbursed($query)
    {
        return $query->where('stage', 'Disbursed');
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The lead this client was converted from.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * The staff member managing this client's loan file.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'managed_by');
    }

    /**
     * The bank whose policy is being used for this loan.
     */
    public function bankPolicy(): BelongsTo
    {
        return $this->belongsTo(BankPolicy::class);
    }

    /**
     * The franchise that originally sourced this client.
     */
    public function franchise(): BelongsTo
    {
        return $this->belongsTo(Franchise::class);
    }
}
