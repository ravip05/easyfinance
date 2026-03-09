<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('departments', function (Blueprint $t) {
            $t->id(); $t->string('name',100)->unique();
            $t->foreignId('head_user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->boolean('is_active')->default(true); $t->timestamps();
        });
        Schema::create('settings', function (Blueprint $t) {
            $t->id(); $t->string('key',100)->unique();
            $t->text('value')->nullable(); $t->string('group',50)->default('general');
            $t->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action',200); $t->string('model_type',100)->nullable();
            $t->unsignedBigInteger('model_id')->nullable();
            $t->json('old_values')->nullable(); $t->json('new_values')->nullable();
            $t->string('ip_address',45)->nullable();
            $t->timestamp('created_at')->useCurrent();
            $t->index(['model_type','model_id']); $t->index('created_at');
        });
    }
    public function down(): void {
        foreach(['audit_logs','settings','departments'] as $t) Schema::dropIfExists($t);
    }
};