<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Franchises table — maps to the FRANCHISES array.
     *
     * Source data:
     *   {name:'Mumbai West DSA', code:'EFW-MUM01', owner:'Rohit Shah',
     *    city:'Mumbai', leads:48, conv:18, amount:'₹2.8Cr',
     *    rate:'0.30%', payout:'₹84,000', status:'Active'}
     *
     * Note: leads, conv, amount, payout are runtime aggregates (computed from
     * leads/payouts tables) — they are NOT stored here to avoid duplication.
     */
    public function up(): void
    {
        Schema::create('franchises', function (Blueprint $table) {
            // ── Identity ──────────────────────────────────────────────────
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique(); // EFW-MUM01, EFW-PUN01 …
            $table->string('owner_name');
            $table->string('city', 100);

            // ── Financial Terms ───────────────────────────────────────────
            // Stored as decimal fraction: 0.30% → 0.003000
            $table->decimal('commission_rate', 6, 5)->default(0.00300);

            // ── State ─────────────────────────────────────────────────────
            $table->enum('status', ['Active', 'Inactive'])->default('Active');

            // ── Contact (optional — can expand later) ─────────────────────
            $table->string('phone', 15)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('franchises');
    }
};
