<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('description')->nullable();
            $t->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $t->enum('priority', ['Low', 'Medium', 'High', 'Urgent'])->default('Medium');
            $t->enum('status', ['Pending', 'In Progress', 'Completed', 'Cancelled'])->default('Pending');
            $t->date('due_date')->nullable();
            $t->timestamp('completed_at')->nullable();
            $t->string('category')->nullable();
            $t->timestamps();
            $t->softDeletes();

            $t->index(['assigned_to', 'status']);
            $t->index(['status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
