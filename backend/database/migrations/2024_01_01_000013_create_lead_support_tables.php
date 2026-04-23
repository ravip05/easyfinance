<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('lead_timelines', function (Blueprint $t) {
            $t->id(); $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action',100); $t->string('from_stage',100)->nullable();
            $t->string('to_stage',100)->nullable(); $t->text('notes')->nullable();
            $t->timestamps();
        });
        Schema::create('lead_notes', function (Blueprint $t) {
            $t->id(); $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->text('content');
            $t->enum('type',['note','call','email','meeting','whatsapp'])->default('note');
            $t->timestamps();
        });
        Schema::create('lead_documents', function (Blueprint $t) {
            $t->id(); $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->string('name'); $t->string('type',50)->nullable();
            $t->string('path'); $t->string('size',20)->nullable();
            $t->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('client_documents', function (Blueprint $t) {
            $t->id(); $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->string('name'); $t->string('type',50)->nullable();
            $t->string('path'); $t->string('size',20)->nullable();
            $t->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('lead_documents'); Schema::dropIfExists('lead_notes');
        Schema::dropIfExists('lead_timelines'); Schema::dropIfExists('client_documents');
    }
};