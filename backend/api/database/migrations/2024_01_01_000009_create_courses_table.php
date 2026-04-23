<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * LMS tables — maps to the COURSES array.
     *
     * Source data shape:
     *   {id, title, thumb:'🏠', color:'#dbeafe',
     *    category:'loans'|'insurance'|'sales'|'compliance'|'franchise',
     *    level:'beginner'|'intermediate'|'advanced',
     *    lessons:8, duration:'2h 15m', progress:100, enrolled:true}
     *
     * The prototype bakes progress + enrolled into each course object,
     * meaning it's per-user data mixed into global course data.
     * Here we split it properly:
     *   courses              → the course catalogue (global)
     *   user_course_progress → per-user enrollment & progress (user-scoped)
     *
     * Duration is stored as total minutes (integer) for arithmetic.
     * '2h 15m' → 135 minutes. Display formatting is handled in the model accessor.
     */
    public function up(): void
    {
        // ── Course Catalogue ──────────────────────────────────────────────
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('thumbnail_emoji', 10)->default('📘'); // stored as emoji char
            $table->string('color_bg', 7)->default('#dbeafe');    // hex background

            $table->enum('category', [
                'loans',
                'insurance',
                'sales',
                'compliance',
                'franchise',
            ]);

            $table->enum('level', ['beginner', 'intermediate', 'advanced'])
                  ->default('beginner');

            $table->unsignedSmallInteger('total_lessons')->default(1);
            $table->unsignedSmallInteger('duration_minutes');  // 135 = '2h 15m'

            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0); // for custom ordering

            $table->timestamps();
        });

        // ── Per-User Enrollment & Progress ───────────────────────────────
        Schema::create('user_course_progress', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('course_id')
                  ->constrained('courses')
                  ->cascadeOnDelete();

            // 0 = not started, 1–99 = in progress, 100 = completed
            $table->unsignedTinyInteger('progress_percent')->default(0);

            $table->boolean('is_enrolled')->default(false);
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamp('completed_at')->nullable(); // set when progress_percent = 100

            // One row per user per course
            $table->unique(['user_id', 'course_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_course_progress');
        Schema::dropIfExists('courses');
    }
};
