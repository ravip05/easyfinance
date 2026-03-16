<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\LmsCourse;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use App\Models\Certificate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LmsLogicTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $course;
    protected $quiz;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'staff']);
        $this->course = LmsCourse::create([
            'title' => 'Test Course',
            'category' => 'loans',
            'level' => 'beginner',
            'is_active' => true
        ]);
        
        $this->quiz = Quiz::create([
            'title' => 'Test Quiz',
            'course_id' => $this->course->id,
            'passing_score' => 70,
            'is_active' => true
        ]);

        // Add 2 questions
        QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'question' => 'Q1',
            'options' => ['A' => 'Opt1', 'B' => 'Opt2'],
            'correct_answer' => 'A'
        ]);
        QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'question' => 'Q2',
            'options' => ['A' => 'Opt1', 'B' => 'Opt2'],
            'correct_answer' => 'B'
        ]);
    }

    public function test_user_can_submit_quiz_and_pass()
    {
        $questions = $this->quiz->questions;
        
        $response = $this->actingAs($this->user)->postJson("/api/lms/quizzes/{$this->quiz->id}/submit", [
            'answers' => [
                $questions[0]->id => 'A', // correct
                $questions[1]->id => 'B'  // correct
            ],
            'time_taken' => 60
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('score', 100)
            ->assertJsonPath('passed', true);

        $this->assertDatabaseHas('quiz_attempts', [
            'user_id' => $this->user->id,
            'quiz_id' => $this->quiz->id,
            'score' => 100,
            'passed' => true
        ]);

        // Since it's linked to a course, a certificate should be issued
        $this->assertDatabaseHas('certificates', [
            'user_id' => $this->user->id,
            'course_id' => $this->course->id
        ]);
    }

    public function test_user_can_submit_quiz_and_fail()
    {
        $questions = $this->quiz->questions;
        
        $response = $this->actingAs($this->user)->postJson("/api/lms/quizzes/{$this->quiz->id}/submit", [
            'answers' => [
                $questions[0]->id => 'B', // wrong
                $questions[1]->id => 'B'  // correct
            ]
        ]);

        // Score should be 50% (1/2)
        $response->assertStatus(200)
            ->assertJsonPath('score', 50)
            ->assertJsonPath('passed', false);

        $this->assertDatabaseMissing('certificates', [
            'user_id' => $this->user->id,
            'course_id' => $this->course->id
        ]);
    }
}
