<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bank policies table — maps to the BANK_POLICIES array.
     *
     * Source data shape:
     *   {name:'SBI', logo:'SBI', color:'#1d4ed8', bg:'#dbeafe',
     *    type:'PSU',
     *    hl_rate:'8.50%', hl_max:'₹10Cr', hl_tenure:'30 yrs', hl_ltv:'90%',
     *    bl_rate:'11.15%', bl_max:'₹5Cr', bl_tenure:'15 yrs',
     *    pl_rate:'12.00%', pl_max:'₹20L', pl_tenure:'7 yrs',
     *    cibil_min:700, income_min:'₹25K/mo', age:'21–70',
     *    processing:'0.35%', prepay:'Nil after 6 EMIs',
     *    updated:'15 Jan 2025', highlight:'Best for govt & salaried employees'}
     *
     * Design decision: Interest rates, max amounts, and tenures are stored
     * as strings matching the display format (e.g. '8.50%', '₹10Cr') because:
     *   1. They are display-only reference data (not used in calculations here)
     *   2. They contain qualitative suffixes ('Cr', 'L', 'yrs')
     * Numeric fields that ARE used in eligibility checks (cibil_min) are integer.
     */
    public function up(): void
    {
        Schema::create('bank_policies', function (Blueprint $table) {
            // ── Identity ──────────────────────────────────────────────────
            $table->id();
            $table->string('name');                  // 'SBI', 'HDFC Bank'
            $table->string('logo_code', 10);         // 'SBI', 'HDFC', 'ICICI' …
            $table->string('brand_color', 7);        // '#1d4ed8'
            $table->string('bg_color', 7);           // '#dbeafe'
            $table->enum('bank_type', ['PSU', 'Private', 'NBFC', 'HFC']);

            // ── Home Loan Terms ───────────────────────────────────────────
            $table->string('hl_interest_rate', 20)->nullable();   // '8.50%'
            $table->string('hl_max_amount', 20)->nullable();      // '₹10Cr'
            $table->string('hl_max_tenure', 20)->nullable();      // '30 yrs'
            $table->string('hl_ltv', 10)->nullable();             // '90%'

            // ── Business Loan Terms ────────────────────────────────────────
            $table->string('bl_interest_rate', 20)->nullable();
            $table->string('bl_max_amount', 20)->nullable();
            $table->string('bl_max_tenure', 20)->nullable();

            // ── Personal Loan Terms ───────────────────────────────────────
            $table->string('pl_interest_rate', 20)->nullable();
            $table->string('pl_max_amount', 20)->nullable();
            $table->string('pl_max_tenure', 20)->nullable();

            // ── Eligibility Criteria ──────────────────────────────────────
            $table->unsignedSmallInteger('cibil_min')->default(700); // numeric — used in filtering
            $table->string('min_income', 30)->nullable();            // '₹25K/mo' (display)
            $table->string('age_range', 20)->nullable();             // '21–70'

            // ── Fee Structure ─────────────────────────────────────────────
            $table->string('processing_fee', 20)->nullable();   // '0.35%'
            $table->string('prepayment_clause', 100)->nullable(); // 'Nil after 6 EMIs'

            // ── Meta ──────────────────────────────────────────────────────
            $table->string('highlight', 200)->nullable(); // 'Best for govt & salaried employees'
            $table->date('policy_updated_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_policies');
    }
};
