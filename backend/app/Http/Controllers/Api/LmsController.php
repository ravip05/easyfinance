<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\LmsCourse;
use App\Models\LmsLesson;
use App\Models\LmsMaterial;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use App\Models\CourseEnrollment;
use App\Models\Certificate;
use Illuminate\Http\Request;

class LmsController extends Controller {
    public function courses(Request $request) {
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);
        $q = LmsCourse::query();
        if ($user->role !== 'admin') $q->where('is_active', true);
        return response()->json($q->orderBy('sort_order')->get()->map(function($c) use($user) {
            $enrollment = CourseEnrollment::where('user_id',$user->id)->where('course_id',$c->id)->first();
            return array_merge($c->toArray(),['progress'=>$enrollment?->progress ?? 0,'enrolled'=>(bool)$enrollment]);
        }));
    }
    public function storeCourse(Request $request) {
        $request->validate(['title'=>'required','category'=>'required']);
        $course = LmsCourse::create($request->all());
        return response()->json($course, 201);
    }
    public function updateCourse(Request $request, $id) {
        $course = LmsCourse::findOrFail($id);
        $course->update($request->all());
        return response()->json($course);
    }
    public function deleteCourse($id) {
        LmsCourse::findOrFail($id)->delete();
        return response()->json(['message'=>'Course deleted']);
    }
    public function courseDetail($id) {
        return response()->json(LmsCourse::with('lessons')->findOrFail($id));
    }
    public function enroll(Request $request, $id) {
        $enrollment = CourseEnrollment::firstOrCreate(['user_id'=>$request->user()->id,'course_id'=>$id],['progress'=>0]);
        return response()->json($enrollment,201);
    }
    public function updateProgress(Request $request, $id) {
        $enrollment = CourseEnrollment::where('user_id',$request->user()->id)->where('course_id',$id)->first();
        if (!$enrollment) {
            $enrollment = CourseEnrollment::create(['user_id'=>$request->user()->id,'course_id'=>$id,'progress'=>$request->progress,'last_lesson_id'=>$request->last_lesson_id]);
        } else {
            $enrollment->update(['progress'=>$request->progress,'last_lesson_id'=>$request->last_lesson_id,'completed_at'=>$request->progress>=100?now():null]);
        }
        if ($request->progress >= 100) {
            Certificate::firstOrCreate(['user_id'=>$request->user()->id,'course_id'=>$id],['score'=>$request->score ?? 100,'issued_at'=>now()]);
        }
        return response()->json($enrollment->fresh());
    }
    public function materials(Request $request) {
        $q = LmsMaterial::with('uploader:id,name')->latest();
        if ($cat = $request->category) $q->where('category',$cat);
        return response()->json($q->get());
    }
    public function uploadMaterial(Request $request) {
        $request->validate(['title'=>'required','file'=>'required|file|max:51200']);
        $path = $request->file('file')->store('lms-materials','public');
        $size = $request->file('file')->getSize();
        $sizeStr = $size > 1048576 ? round($size/1048576,1).' MB' : round($size/1024,1).' KB';
        $mat  = LmsMaterial::create(['title'=>$request->title,'category'=>$request->category ?? 'General','type'=>strtoupper($request->file('file')->extension()),'file_path'=>$path,'file_size'=>$sizeStr,'uploaded_by'=>$request->user()->id]);
        return response()->json($mat,201);
    }
    public function updateMaterial(Request $request, $id) {
        $mat = LmsMaterial::findOrFail($id);
        $mat->update($request->only(['title','category']));
        return response()->json($mat);
    }
    public function deleteMaterial($id) {
        LmsMaterial::findOrFail($id)->delete();
        return response()->json(['message'=>'Material deleted']);
    }
    // Lessons management (admin)
    public function storeLesson(Request $request, $courseId) {
        $request->validate(['title'=>'required','type'=>'required']);
        $course = LmsCourse::findOrFail($courseId);
        $maxOrder = LmsLesson::where('course_id',$courseId)->max('sort_order') ?? 0;
        $lesson = LmsLesson::create(array_merge($request->all(),['course_id'=>$courseId,'sort_order'=>$maxOrder+1]));
        $course->update(['lesson_count' => $course->lessons()->count()]);
        return response()->json($lesson,201);
    }
    public function deleteLesson($courseId, $lessonId) {
        $lesson = LmsLesson::where('course_id',$courseId)->findOrFail($lessonId);
        $lesson->delete();
        $course = LmsCourse::findOrFail($courseId);
        $course->update(['lesson_count' => $course->lessons()->count()]);
        return response()->json(['message'=>'Lesson deleted']);
    }
    // Quizzes — include questions so the frontend can render them
    public function quizzes(Request $request) {
        $quizzes = Quiz::where('is_active',true)->with('questions:id,quiz_id,question,options')->withCount('questions')->get()
            ->map(function($q) use($request) {
                $best = QuizAttempt::where('user_id',$request->user()->id)->where('quiz_id',$q->id)->max('score');
                $arr = json_decode(json_encode($q), true);
                $arr['best_score'] = $best;
                $arr['attempted'] = (bool)$best;
                return $arr;
            });
        return response()->json($quizzes);
    }
    // Store quiz (admin)
    public function storeQuiz(Request $request) {
        $request->validate(['title'=>'required','passing_score'=>'required|integer']);
        $quiz = Quiz::create([
            'title' => $request->title,
            'course_id' => $request->course_id,
            'passing_score' => $request->passing_score,
            'time_limit_minutes' => $request->time_limit_minutes ?? 10,
            'is_active' => true,
        ]);
        // Add questions if provided
        if ($request->questions && is_array($request->questions)) {
            foreach ($request->questions as $qData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $qData['question'],
                    'options' => $qData['options'],
                    'correct_answer' => $qData['correct_answer'],
                    'explanation' => $qData['explanation'] ?? null,
                ]);
            }
        }
        return response()->json($quiz->load('questions'), 201);
    }
    public function submitQuiz(Request $request, $id) {
        $quiz    = Quiz::with('questions')->findOrFail($id);
        $answers = $request->answers ?? [];
        $correct = 0;
        foreach ($quiz->questions as $q) {
            if (($answers[$q->id] ?? null) === $q->correct_answer) $correct++;
        }
        $total   = $quiz->questions->count();
        $score   = $total ? round($correct/$total*100) : 0;
        $attempt = QuizAttempt::create(['quiz_id'=>$id,'user_id'=>$request->user()->id,'score'=>$score,'answers'=>$answers,'passed'=>$score>=$quiz->passing_score,'time_taken'=>$request->time_taken]);
        if ($score >= $quiz->passing_score && $quiz->course_id) {
            Certificate::firstOrCreate(['user_id'=>$request->user()->id,'course_id'=>$quiz->course_id,'quiz_attempt_id'=>$attempt->id],['score'=>$score,'issued_at'=>now()]);
        }
        return response()->json(['score'=>$score,'passed'=>$attempt->passed,'correct'=>$correct,'total'=>$total]);
    }
    public function leaderboard(Request $request) {
        try {
            $data = \Illuminate\Support\Facades\DB::table('quiz_attempts')
                ->select('user_id')
                ->selectRaw('COUNT(*) as total_quizzes')
                ->selectRaw('SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_quizzes')
                ->selectRaw('AVG(score) as average_score')
                ->selectRaw('MAX(score) as best_score')
                ->groupBy('user_id')
                ->get();

            $userIds = $data->pluck('user_id');
            $users = \App\Models\User::whereIn('id', $userIds)->select('id', 'name')->get()->keyBy('id');

            $lb = $data->map(function($row) use ($users) {
                return [
                    'user_id' => $row->user_id,
                    'user' => $users->get($row->user_id),
                    'quizzes_taken' => (int)$row->total_quizzes,
                    'avg_score' => round((float)$row->average_score, 1),
                    'best_score' => (int)$row->best_score,
                    'points' => (int)$row->passed_quizzes * 10
                ];
            })->sortByDesc('points')->values()->take(10);

            return response()->json($lb);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Leaderboard error: ' . $e->getMessage());
            // Return empty list instead of 500
            return response()->json([]);
        }
    }
    public function certificates(Request $request) {
        return response()->json(Certificate::where('user_id',$request->user()->id)->with('course:id,title')->get());
    }
}
