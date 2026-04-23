<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Users table — covers ALL_STAFF, DEMO_USERS, and EMPLOYEES arrays.
     *
     * Roles:
     *   admin   → full access, no team leader
     *   manager → has direct reports (staff), sees team leads
     *   staff   → assigned to a manager via team_leader_id
     *   dsa     → external DSA partner, linked to a franchise
     *
     * Hierarchy is self-referential: staff.team_leader_id → users.id (manager row).
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // ── Identity ──────────────────────────────────────────────────
            $table->id();
            $table->string('emp_code', 10)->unique()->nullable(); // EF-001, EF-002 …
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // ── Role & Department ─────────────────────────────────────────
            $table->enum('role', ['admin', 'manager', 'staff', 'dsa'])
                  ->default('staff');
            $table->string('department', 100)->nullable(); // 'Home Loans', 'Insurance' …

            // ── Contact ───────────────────────────────────────────────────
            $table->string('phone', 15)->unique()->nullable();

            // ── Employment ────────────────────────────────────────────────
            $table->enum('status', ['Active', 'On Leave', 'Inactive'])
                  ->default('Active');
            $table->date('joining_date')->nullable();
            $table->decimal('commission_rate', 5, 4)->nullable(); // stored as 0.0025 → 0.25%

            // ── Hierarchy (self-referential) ───────────────────────────────
            // staff → their manager's id; manager → their admin's id; admin → null
            $table->foreignId('team_leader_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // ── DSA Franchise Link ─────────────────────────────────────────
            // Populated for role=dsa; null for internal staff
            $table->foreignId('franchise_id')
                  ->nullable()
                  ->constrained('franchises')
                  ->nullOnDelete();

            // ── Auth ──────────────────────────────────────────────────────
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
