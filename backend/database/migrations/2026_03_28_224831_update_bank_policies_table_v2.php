<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bank_policies', function (Blueprint $table) {
            $table->string('short_code', 10)->nullable();
            $table->text('description')->nullable();
            $table->string('policy_url')->nullable();
            $table->string('category')->nullable()->default('All'); // For filtering
        });
    }

    public function down(): void
    {
        Schema::table('bank_policies', function (Blueprint $table) {
            $table->dropColumn(['short_code', 'description', 'policy_url', 'category']);
        });
    }
};
