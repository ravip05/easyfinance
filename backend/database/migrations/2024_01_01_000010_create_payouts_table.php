<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Payouts table — maps to the PAYOUTS array.
     *
     * Source data shape:
     *   {id, name, role:'Manager'|'Staff'|'Franchise',
     *    type:'commission'|'bonus'|'franchise',
     *    leads:42, converted:18, disbursed:'₹2.1Cr',
     *    rate:'0.15%', gross:'₹31,500', tds:'₹3,150', net:'₹28,350',
     *    status:'approved'|'pending'|'paid'}
     *
     * Payout recipients are EITHER an internal user OR a franchise (never both).
     * The payout_type enum distinguishes which:
     *   commission  → staff/manager gets % of disbursed amount
     *   bonus       → staff gets a fixed incentive
     *   franchise   → DSA franchise gets their agreed commission rate
     *
     * All monetary values are stored as raw decimal rupees (not formatted strings).
     */
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();

            // ── Recipient — one of these two will be populated ────────────
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete(); // for staff / manager payouts

            $table->foreignId('franchise_id')
                  ->nullable()
                  ->constrained('franchises')
                  ->nullOnDelete(); // for DSA franchise payouts

            // ── Payout Type ───────────────────────────────────────────────
            $table->enum('payout_type', ['commission', 'bonus', 'franchise'])
                  ->default('commission');

            // ── Performance Metrics for this payout period ────────────────
            $table->unsignedSmallInteger('period_leads')->default(0);
            $table->unsignedSmallInteger('period_converted')->default(0);
            $table->decimal('period_disbursed_amount', 15, 2)->default(0); // raw rupees

            // ── Financials ────────────────────────────────────────────────
            // rate stored as string to support both '0.25%' and 'Fixed'
            $table->string('commission_rate', 20)->nullable();
            $table->decimal('gross_amount', 12, 2)->default(0);
            $table->decimal('tds_amount', 12, 2)->default(0);    // 10% TDS
            $table->decimal('net_amount', 12, 2)->default(0);    // gross - tds

            // ── Status ────────────────────────────────────────────────────
            $table->enum('status', ['pending', 'approved', 'paid'])
                  ->default('pending');

            // ── Period ────────────────────────────────────────────────────
            $table->date('period_start')->nullable(); // e.g. 2025-01-01
            $table->date('period_end')->nullable();   // e.g. 2025-01-31

            // ── Processing ────────────────────────────────────────────────
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['franchise_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};
