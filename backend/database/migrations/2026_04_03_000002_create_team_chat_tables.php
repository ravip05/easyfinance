<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_channels', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // e.g. "general"
            $table->string('label');          // e.g. "General Discussion"
            $table->string('icon')->default('💬');
            $table->string('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('team_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('channel_id');
            $table->unsignedBigInteger('user_id');
            $table->text('message');
            $table->unsignedBigInteger('reply_to_id')->nullable();
            $table->timestamps();

            $table->foreign('channel_id')->references('id')->on('team_channels')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('reply_to_id')->references('id')->on('team_messages')->nullOnDelete();

            $table->index(['channel_id', 'created_at']);
        });

        // Seed default channels
        \DB::table('team_channels')->insert([
            ['name' => 'general',    'label' => 'General Discussion', 'icon' => '💬', 'description' => 'Company-wide chat', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'leads-help', 'label' => 'Leads Help',        'icon' => '🎯', 'description' => 'Ask questions about leads & files', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'doubts',     'label' => 'Doubt Corner',      'icon' => '❓', 'description' => 'General doubts & queries', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'policy-qa',  'label' => 'Policy Q&A',        'icon' => '🏦', 'description' => 'Bank policy discussions', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'wins',       'label' => 'Wins & Celebrations','icon' => '🎉', 'description' => 'Share your wins!', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('team_messages');
        Schema::dropIfExists('team_channels');
    }
};
