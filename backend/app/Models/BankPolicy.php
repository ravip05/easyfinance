<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankPolicy extends Model
{
    use HasFactory;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'name',
        'logo_code',
        'brand_color',
        'bg_color',
        'bank_type',
        'hl_interest_rate',
        'hl_max_amount',
        'hl_max_tenure',
        'hl_ltv',
        'bl_interest_rate',
        'bl_max_amount',
        'bl_max_tenure',
        'pl_interest_rate',
        'pl_max_amount',
        'pl_max_tenure',
        'cibil_min',
        'min_income',
        'age_range',
        'processing_fee',
        'prepayment_clause',
        'highlight',
        'policy_updated_at',
        'is_active',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'cibil_min'         => 'integer',
            'is_active'         => 'boolean',
            'policy_updated_at' => 'date',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Banks that accept a given CIBIL score.
     * Usage: BankPolicy::eligibleForCibil(720)->get()
     */
    public function scopeEligibleForCibil($query, int $score)
    {
        return $query->where('cibil_min', '<=', $score);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Clients currently being processed with this bank's policy.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Returns the interest rate for a given loan type.
     * Usage: $bank->rateFor('Home Loan') → '8.50%'
     */
    public function rateFor(string $loanType): ?string
    {
        return match ($loanType) {
            'Home Loan'      => $this->hl_interest_rate,
            'Business Loan'  => $this->bl_interest_rate,
            'Personal Loan'  => $this->pl_interest_rate,
            default          => null,
        };
    }
}
