<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('bank_policies', function (Blueprint $t) {
            $t->id(); $t->string('bank_name'); $t->string('bank_code',20)->unique();
            $t->enum('bank_type',['PSU','Private','NBFC','HFC'])->default('Private');
            $t->string('color',20)->nullable(); $t->string('bg_color',20)->nullable();
            foreach(['hl','bl','pl','car','lap'] as $p) {
                $t->string("{$p}_rate",20)->nullable(); $t->string("{$p}_max",20)->nullable();
                $t->string("{$p}_tenure",20)->nullable();
                if($p==='hl') $t->string("{$p}_ltv",10)->nullable();
            }
            $t->unsignedSmallInteger('cibil_min')->default(650);
            $t->string('income_min',30)->nullable(); $t->string('eligible_age',20)->nullable();
            $t->string('processing_fee',20)->nullable(); $t->string('prepayment',100)->nullable();
            $t->string('highlight',200)->nullable(); $t->boolean('is_active')->default(true);
            $t->date('updated_policy_at')->nullable(); $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bank_policies'); }
};