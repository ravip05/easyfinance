<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// adds parent-child threading to ticket replies and a status transition log to tickets

return new class extends Migration
{
    public function up(): void
    {
        // threading column on replies for recursive parent-child nesting
        Schema::table('ticket_replies', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable()->after('ticket_id');
            $table->boolean('is_internal_note')->default(false)->after('message');

            $table->foreign('parent_id')
                  ->references('id')
                  ->on('ticket_replies')
                  ->nullOnDelete();

            $table->index('parent_id');
        });

        // status transition audit log for compliance and debugging
        Schema::create('ticket_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users')->cascadeOnDelete();
            $table->string('from_status', 30);
            $table->string('to_status', 30);
            $table->string('trigger', 50)->default('manual');
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_status_logs');

        Schema::table('ticket_replies', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropIndex(['parent_id']);
            $table->dropColumn(['parent_id', 'is_internal_note']);
        });
    }
};
