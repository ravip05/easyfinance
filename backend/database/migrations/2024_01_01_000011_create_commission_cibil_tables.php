<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('commission_slabs', function (Blueprint $t) {
            $t->id(); $t->string('role',50); $t->string('loan_type',50)->default('All');
            $t->decimal('rate',7,4); $t->decimal('min_disbursement',15,2)->default(0);
            $t->boolean('is_active')->default(true); $t->timestamps();
        });
        Schema::create('commissions', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $t->string('loan_type',50)->nullable();
            $t->decimal('disbursed_amount',15,2)->default(0); $t->decimal('rate',7,4)->default(0);
            $t->decimal('amount',12,2)->default(0);
            $t->enum('status',['pending','approved','paid'])->default('pending');
            $t->date('payout_date')->nullable(); $t->timestamps();
        });
        Schema::create('cibil_checks', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $t->string('checked_name')->nullable(); $t->string('pan',10)->nullable();
            $t->unsignedSmallInteger('score')->nullable(); $t->string('rating',30)->nullable();
            $t->json('response_data')->nullable(); $t->timestamps();
        });
    }
    public function down(): void {
        foreach(['cibil_checks','commissions','commission_slabs'] as $t) Schema::dropIfExists($t);
    }
};