<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Phase 1 schema expansion
 *
 * adds missing lead fields from CRM Updates.docx
 * adds the client role to the users enum
 * adds experience_years, seniority, reference, virtual_id to users
 * creates push_devices, tickets, ticket_replies, holidays,
 * company_policies, and virtual_cards tables
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── leads table: add missing fields from PRD ─────────────────────────
        Schema::table('leads', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('email');
            $table->string('location', 200)->nullable()->after('birth_date');
            $table->enum('income_status', ['Salaried', 'Self-Employed', 'Business', 'Retired', 'Other'])
                  ->nullable()->after('monthly_income');
            $table->tinyInteger('running_loans')->unsigned()->default(0)->after('income_status');
            $table->text('previous_issues')->nullable()->after('running_loans');
            $table->smallInteger('cibil_score')->unsigned()->nullable()->after('previous_issues');
            $table->decimal('lead_value', 15, 2)->nullable()->after('cibil_score');
            $table->time('follow_up_time')->nullable()->after('follow_up_date');
        });

        // ── users table: expand role enum + add new columns ──────────────────
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'staff', 'dsa', 'client'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'staff'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'manager', 'staff', 'dsa', 'client'])
                      ->default('staff')
                      ->change();
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('virtual_id', 20)->unique()->nullable()->after('franchise_id');
            $table->tinyInteger('experience_years')->unsigned()->default(0)->after('virtual_id');
            $table->enum('seniority', ['Junior', 'Mid', 'Senior', 'Lead', 'Director'])
                  ->default('Junior')->after('experience_years');
            $table->string('reference', 255)->nullable()->after('seniority');
        });

        // ── push_devices ─────────────────────────────────────────────────────
        Schema::create('push_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('platform', ['android', 'ios', 'web']);
            $table->text('token');
            $table->string('device_name', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['user_id', 'platform']);
        });

        // ── tickets ──────────────────────────────────────────────────────────
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 20)->unique();
            $table->enum('type', ['client', 'staff', 'franchise']);
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->foreignId('client_id')->nullable()->constrained('clients');
            $table->foreignId('franchise_id')->nullable()->constrained('franchises');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            $table->index(['type', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('created_by');
        });

        // ── ticket_replies ───────────────────────────────────────────────────
        Schema::create('ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->text('message');
            $table->boolean('is_internal')->default(false);
            $table->timestamps();
        });

        // ── holidays ─────────────────────────────────────────────────────────
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('date');
            $table->enum('type', ['national', 'regional', 'company'])->default('company');
            $table->boolean('is_optional')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->unique(['date', 'title']);
        });

        // ── company_policies ─────────────────────────────────────────────────
        Schema::create('company_policies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category', 100)->default('general');
            $table->longText('content');
            $table->string('version', 10)->default('1.0');
            $table->boolean('is_active')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // ── virtual_cards ────────────────────────────────────────────────────
        Schema::create('virtual_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('virtual_id', 20)->unique();
            $table->string('designation', 100)->nullable();
            $table->string('tagline', 255)->nullable();
            $table->string('whatsapp', 15)->nullable();
            $table->string('linkedin', 255)->nullable();
            $table->string('qr_code_path', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtual_cards');
        Schema::dropIfExists('company_policies');
        Schema::dropIfExists('holidays');
        Schema::dropIfExists('ticket_replies');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('push_devices');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['virtual_id', 'experience_years', 'seniority', 'reference']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'staff', 'dsa'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'staff'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'manager', 'staff', 'dsa'])
                      ->default('staff')
                      ->change();
            });
        }

        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date', 'location', 'income_status', 'running_loans',
                'previous_issues', 'cibil_score', 'lead_value', 'follow_up_time',
            ]);
        });
    }
};
