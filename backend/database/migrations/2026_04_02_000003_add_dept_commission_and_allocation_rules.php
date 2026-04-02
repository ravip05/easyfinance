<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $t) {
            if (!Schema::hasColumn('departments', 'commission_rate')) {
                $t->decimal('commission_rate', 6, 4)->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('departments', 'description')) {
                $t->text('description')->nullable()->after('commission_rate');
            }
        });

        // Auto-team allocation rules
        Schema::create('team_allocation_rules', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->foreignId('manager_id')->constrained('users')->cascadeOnDelete();
            $t->string('department')->nullable();
            $t->string('role_target')->default('staff'); // which role gets auto-assigned
            $t->integer('max_capacity')->default(10);    // max staff per manager
            $t->boolean('is_active')->default(true);
            $t->timestamps();

            $t->index(['is_active', 'department']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_allocation_rules');
        Schema::table('departments', function (Blueprint $t) {
            $t->dropColumn(['commission_rate', 'description']);
        });
    }
};
