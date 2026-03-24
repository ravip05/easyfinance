<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_ledger_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('commission_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('user_id')
                  ->comment('employee who earned the commission')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->decimal('amount', 12, 2);

            $table->foreignId('processed_by')
                  ->comment('admin/manager who approved payout')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->string('reference_number', 64)
                  ->unique()
                  ->comment('PAY-YYYYMMDD-XXXX format');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('processed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_ledger_entries');
    }
};
