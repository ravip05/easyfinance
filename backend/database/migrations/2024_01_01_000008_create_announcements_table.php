<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Announcements table — maps to the ANNOUNCEMENTS array.
     *
     * Source data shape:
     *   {id, title, message, target:'all'|'staff'|'dsa'|'franchise_all',
     *    priority:'normal'|'important'|'urgent',
     *    channels:['app','sms','email','whatsapp'],
     *    by (→ created_by FK), date, read:[]}
     *
     * Channels are stored as individual boolean flags rather than a JSON array
     * so they can be filtered/indexed efficiently and avoid JSON parsing.
     *
     * The announcement_reads pivot tracks per-user read receipts, replacing
     * the hardcoded `read:[]` array from the prototype.
     */
    public function up(): void
    {
        // ── Announcements ─────────────────────────────────────────────────
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();

            // ── Content ───────────────────────────────────────────────────
            $table->string('title');
            $table->text('message');

            // ── Audience ──────────────────────────────────────────────────
            $table->enum('target', [
                'all',            // All internal users
                'staff',          // Staff role only
                'manager',        // Managers only
                'dsa',            // DSA partners only
                'franchise_all',  // All franchise owners
            ])->default('all');

            $table->enum('priority', ['normal', 'important', 'urgent'])
                  ->default('normal');

            // ── Delivery Channels (boolean flags) ─────────────────────────
            $table->boolean('channel_app')->default(true);
            $table->boolean('channel_sms')->default(false);
            $table->boolean('channel_email')->default(false);
            $table->boolean('channel_whatsapp')->default(false);

            // ── Scheduling ────────────────────────────────────────────────
            $table->timestamp('scheduled_at')->nullable(); // null = immediate
            $table->timestamp('published_at')->nullable(); // set when actually sent

            // ── Authorship ────────────────────────────────────────────────
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();

            $table->index(['target', 'priority']);
            $table->index('published_at');
        });

        // ── Read Receipts ─────────────────────────────────────────────────
        Schema::create('announcement_reads', function (Blueprint $table) {
            $table->id();

            $table->foreignId('announcement_id')
                  ->constrained('announcements')
                  ->cascadeOnDelete();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamp('read_at');

            // One row per user per announcement
            $table->unique(['announcement_id', 'user_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_reads');
        Schema::dropIfExists('announcements');
    }
};
