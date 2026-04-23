<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasFactory;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'user_id',
        'franchise_id',
        'payout_type',
        'period_leads',
        'period_converted',
        'period_disbursed_amount',
        'commission_rate',
        'gross_amount',
        'tds_amount',
        'net_amount',
        'status',
        'period_start',
        'period_end',
        'approved_by',
        'approved_at',
        'paid_at',
        'notes',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'period_disbursed_amount' => 'decimal:2',
            'gross_amount'            => 'decimal:2',
            'tds_amount'              => 'decimal:2',
            'net_amount'              => 'decimal:2',
            'period_start'            => 'date',
            'period_end'              => 'date',
            'approved_at'             => 'datetime',
            'paid_at'                 => 'datetime',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Formatted disbursed amount for display.
     * 21000000 → "₹2.1Cr"
     */
    public function getDisbursedDisplayAttribute(): string
    {
        $amt = (float) $this->period_disbursed_amount;

        if ($amt >= 10_000_000) {
            return '₹' . number_format($amt / 10_000_000, 1) . 'Cr';
        }
        if ($amt >= 100_000) {
            return '₹' . number_format($amt / 100_000, 1) . 'L';
        }

        return '₹' . number_format($amt, 0, '.', ',');
    }

    /**
     * Formatted gross amount (e.g. "₹31,500").
     */
    public function getGrossDisplayAttribute(): string
    {
        return '₹' . number_format($this->gross_amount, 0, '.', ',');
    }

    /**
     * The display name of whoever is receiving this payout.
     * Could be an internal user or a franchise owner.
     */
    public function getRecipientNameAttribute(): string
    {
        if ($this->user_id) {
            return $this->user?->name ?? 'Unknown';
        }
        if ($this->franchise_id) {
            return $this->franchise?->owner_name ?? 'Unknown Franchise';
        }

        return 'Unknown';
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Payouts for a specific period.
     * Usage: Payout::forPeriod('2025-01-01', '2025-01-31')->get()
     */
    public function scopeForPeriod($query, string $start, string $end)
    {
        return $query->whereBetween('period_start', [$start, $end]);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The internal user (staff/manager) receiving this payout.
     * Null for franchise payouts.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The franchise receiving this payout.
     * Null for internal staff payouts.
     */
    public function franchise(): BelongsTo
    {
        return $this->belongsTo(Franchise::class);
    }

    /**
     * The admin who approved this payout.
     */
    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
