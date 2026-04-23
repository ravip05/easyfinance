<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('lms_courses', function (Blueprint $t) {
            $t->id(); $t->string('title'); $t->text('description')->nullable();
            $t->string('thumbnail',10)->nullable();
            $t->enum('category',['loans','insurance','sales','compliance','hr','general'])->default('loans');
            $t->enum('level',['beginner','intermediate','advanced'])->default('beginner');
            $t->unsignedSmallInteger('duration_minutes')->default(60);
            $t->unsignedSmallInteger('lesson_count')->default(0);
            $t->boolean('is_active')->default(true);
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->unsignedSmallInteger('sort_order')->default(0); $t->timestamps();
        });
        Schema::create('lms_lessons', function (Blueprint $t) {
            $t->id(); $t->foreignId('course_id')->constrained('lms_courses')->cascadeOnDelete();
            $t->string('title'); $t->enum('type',['video','pdf','text','quiz'])->default('text');
            $t->longText('content')->nullable(); $t->string('video_url')->nullable();
            $t->string('file_path')->nullable(); $t->unsignedSmallInteger('duration_minutes')->default(10);
            $t->unsignedSmallInteger('sort_order')->default(0); $t->timestamps();
        });
        Schema::create('lms_materials', function (Blueprint $t) {
            $t->id(); $t->string('title'); $t->string('category',50)->nullable();
            $t->string('type',30)->default('PDF'); $t->string('file_path')->nullable();
            $t->string('file_size',20)->nullable();
            $t->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->unsignedInteger('view_count')->default(0); $t->timestamps();
        });
        Schema::create('quizzes', function (Blueprint $t) {
            $t->id(); $t->string('title');
            $t->foreignId('course_id')->nullable()->constrained('lms_courses')->nullOnDelete();
            $t->unsignedTinyInteger('passing_score')->default(70);
            $t->unsignedSmallInteger('time_limit_minutes')->default(15);
            $t->boolean('is_active')->default(true); $t->timestamps();
        });
        Schema::create('quiz_questions', function (Blueprint $t) {
            $t->id(); $t->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $t->text('question'); $t->json('options');
            $t->string('correct_answer',5); $t->text('explanation')->nullable(); $t->timestamps();
        });
        Schema::create('quiz_attempts', function (Blueprint $t) {
            $t->id(); $t->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->unsignedTinyInteger('score')->default(0); $t->json('answers')->nullable();
            $t->boolean('passed')->default(false); $t->unsignedSmallInteger('time_taken')->nullable();
            $t->timestamps();
        });
        Schema::create('course_enrollments', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('course_id')->constrained('lms_courses')->cascadeOnDelete();
            $t->unsignedTinyInteger('progress')->default(0);
            $t->timestamp('completed_at')->nullable();
            $t->foreignId('last_lesson_id')->nullable()->constrained('lms_lessons')->nullOnDelete();
            $t->unique(['user_id','course_id']); $t->timestamps();
        });
        Schema::create('certificates', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('course_id')->constrained('lms_courses')->cascadeOnDelete();
            $t->foreignId('quiz_attempt_id')->nullable()->constrained('quiz_attempts')->nullOnDelete();
            $t->unsignedTinyInteger('score')->default(0);
            $t->timestamp('issued_at')->nullable(); $t->timestamps();
        });
    }
    public function down(): void {
        foreach(['certificates','course_enrollments','quiz_attempts','quiz_questions','quizzes','lms_materials','lms_lessons','lms_courses'] as $t) Schema::dropIfExists($t);
    }
};