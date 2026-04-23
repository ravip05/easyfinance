<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Franchise extends Model
{
    use HasFactory;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'name',
        'code',
        'owner_name',
        'city',
        'commission_rate',
        'status',
        'phone',
        'email',
        'address',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:5',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Returns commission rate as a display string.
     * 0.003 → "0.30%"
     */
    public function getCommissionRateDisplayAttribute(): string
    {
        return number_format($this->commission_rate * 100, 2) . '%';
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * All DSA users linked to this franchise.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * All leads that came through this franchise.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * All clients associated with this franchise.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Payout records for this franchise.
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Total leads count (for display — avoids N+1 if withCount() used).
     */
    public function getLeadsCountAttribute(): int
    {
        return $this->leads()->count();
    }

    /**
     * Converted clients count.
     */
    public function getConvertedCountAttribute(): int
    {
        return $this->clients()->where('stage', 'Disbursed')->count();
    }
}
