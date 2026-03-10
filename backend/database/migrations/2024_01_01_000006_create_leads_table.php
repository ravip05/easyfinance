<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Leads table — the core pipeline entity.
     *
     * Source data shape (from prototype LEADS array + addLead() payload):
     *   name, phone, type (loan_type), amount (raw decimal), stage,
     *   assigned (→ assigned_to FK), priority, followup (follow_up_date),
     *   source, franchiseCode (→ franchise_id FK), notes, addedBy (→ added_by FK)
     *
     * Stages (full pipeline from renderLeads select):
     *   New → Contacted → Docs Pending → Docs Received → CIBIL
     *   → Login → Processing → Sanctioned → Disbursed → Closed
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            // ── Identity ──────────────────────────────────────────────────
            $table->id();

            // ── Applicant Details ─────────────────────────────────────────
            $table->string('name');
            $table->string('phone', 15);
            $table->string('email')->nullable();
            $table->string('pan_number', 10)->nullable(); // ABCDE1234F format

            // ── Loan Details ──────────────────────────────────────────────
            $table->enum('loan_type', [
                'Home Loan',
                'Business Loan',
                'Personal Loan',
                'Car Loan',
                'LAP',            // Loan Against Property
                'Insurance',
            ]);
            // Stored as raw rupees (45,00,000 not ₹45L) for arithmetic
            $table->decimal('amount', 15, 2)->nullable();
            $table->decimal('monthly_income', 12, 2)->nullable();

            // ── Pipeline Stage ────────────────────────────────────────────
            $table->enum('stage', [
                'New',
                'Contacted',
                'Docs Pending',
                'Docs Received',
                'CIBIL',
                'Login',
                'Processing',
                'Sanctioned',
                'Disbursed',
                'Closed',
            ])->default('New');

            $table->enum('priority', ['High', 'Medium', 'Low'])->default('Medium');

            // ── Lead Source ───────────────────────────────────────────────
            $table->enum('source', [
                'Direct',
                'Website',
                'Referral',
                'DSA Partner',
                'Social Media',
                'Walk-in',
            ])->default('Direct');

            // ── Scheduling ────────────────────────────────────────────────
            $table->date('follow_up_date')->nullable();

            // ── Notes ─────────────────────────────────────────────────────
            $table->text('notes')->nullable();

            // ── Relationships ─────────────────────────────────────────────
            // Which staff member is working this lead
            $table->foreignId('assigned_to')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Who created / imported this lead
            $table->foreignId('added_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Which franchise brought this lead (null for direct/internal leads)
            $table->foreignId('franchise_id')
                  ->nullable()
                  ->constrained('franchises')
                  ->nullOnDelete();

            // ── Duplicate Detection ───────────────────────────────────────
            // Indexed for fast duplicate-phone lookups (prototype checks this)
            $table->index('phone');
            $table->index(['stage', 'assigned_to']); // common compound filter

            $table->timestamps();
            $table->softDeletes(); // support archive instead of hard-delete
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
