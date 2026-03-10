<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Clients table — a lead that has progressed to active loan processing.
     *
     * Source data shape (from prototype CLIENTS array):
     *   name, phone, type (loan_type), amount, cibil (cibil_score),
     *   stage, manager (→ managed_by FK), franchiseCode (→ franchise_id FK)
     *
     * A Client is a CONVERTED Lead. The lead_id FK preserves the audit trail:
     * you can always trace which lead became this client.
     *
     * Client stages (subset of lead stages — post-qualification only):
     *   New → Docs Pending → Login → Processing → Sanctioned → Disbursed
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            // ── Identity ──────────────────────────────────────────────────
            $table->id();

            // ── Audit Trail ───────────────────────────────────────────────
            // The lead that was converted to create this client record
            $table->foreignId('lead_id')
                  ->nullable()
                  ->constrained('leads')
                  ->nullOnDelete();

            // ── Applicant Details ─────────────────────────────────────────
            $table->string('name');
            $table->string('phone', 15);
            $table->string('email')->nullable();
            $table->string('pan_number', 10)->nullable();   // ABCDE1234F
            $table->string('aadhaar_number', 12)->nullable();

            // ── Loan Details ──────────────────────────────────────────────
            $table->enum('loan_type', [
                'Home Loan',
                'Business Loan',
                'Personal Loan',
                'Car Loan',
                'LAP',
                'Insurance',
            ]);
            $table->decimal('amount', 15, 2)->nullable();      // Loan amount
            $table->decimal('monthly_income', 12, 2)->nullable();
            $table->decimal('emi_amount', 10, 2)->nullable();  // Approved EMI
            $table->unsignedSmallInteger('tenure_months')->nullable(); // e.g. 240 (20 yrs)
            $table->date('disbursed_at')->nullable();           // Disbursement date

            // ── CIBIL ─────────────────────────────────────────────────────
            // Range 300–900; stored as integer, validated in model/request
            $table->unsignedSmallInteger('cibil_score')->nullable();

            // ── Processing Stage ──────────────────────────────────────────
            $table->enum('stage', [
                'New',
                'Docs Pending',
                'Login',
                'Processing',
                'Sanctioned',
                'Disbursed',
            ])->default('New');

            // ── Bank Assigned ─────────────────────────────────────────────
            $table->foreignId('bank_policy_id')
                  ->nullable()
                  ->constrained('bank_policies')
                  ->nullOnDelete();

            $table->string('bank_reference_number')->nullable(); // Bank's file/case no.

            // ── Notes ─────────────────────────────────────────────────────
            $table->text('notes')->nullable();

            // ── Relationships ─────────────────────────────────────────────
            // The manager/staff handling this client's file
            $table->foreignId('managed_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->foreignId('franchise_id')
                  ->nullable()
                  ->constrained('franchises')
                  ->nullOnDelete();

            // ── Indexes ───────────────────────────────────────────────────
            $table->index('phone');
            $table->index('pan_number');
            $table->index(['stage', 'managed_by']);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
