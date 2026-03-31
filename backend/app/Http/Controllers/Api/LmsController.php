<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\LmsCourse;
use App\Models\LmsMaterial;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\CourseEnrollment;
use App\Models\Certificate;
use Illuminate\Http\Request;

class LmsController extends Controller {
    public function courses(Request $request) {
        $user = $request->user();
        $q = LmsCourse::query();
        if ($user->role !== 'admin') $q->where('is_active', true);
        return response()->json($q->orderBy('sort_order')->get()->map(function($c) use($user) {
            $enrollment = CourseEnrollment::where('user_id',$user->id)->where('course_id',$c->id)->first();
            return array_merge((array)$c,['progress'=>$enrollment?->progress ?? 0,'enrolled'=>(bool)$enrollment]);
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
        $enrollment = CourseEnrollment::where('user_id',$request->user()->id)->where('course_id',$id)->firstOrFail();
        $enrollment->update(['progress'=>$request->progress,'last_lesson_id'=>$request->last_lesson_id,'completed_at'=>$request->progress>=100?now():null]);
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
        $mat  = LmsMaterial::create(['title'=>$request->title,'category'=>$request->category,'type'=>strtoupper($request->file('file')->extension()),'file_path'=>$path,'file_size'=>round($request->file('file')->getSize()/1024,1).' KB','uploaded_by'=>$request->user()->id]);
        return response()->json($mat,201);
    }
    public function updateMaterial(Request $request, $id) {
        $mat = LmsMaterial::findOrFail($id);
        $mat->update($request->all());
        return response()->json($mat);
    }
    public function deleteMaterial($id) {
        LmsMaterial::findOrFail($id)->delete();
        return response()->json(['message'=>'Material deleted']);
    }
    public function quizzes(Request $request) {
        $quizzes = Quiz::where('is_active',true)->withCount('questions')->get()
            ->map(function($q) use($request) {
                $best = QuizAttempt::where('user_id',$request->user()->id)->where('quiz_id',$q->id)->max('score');
                return array_merge((array)$q,['best_score'=>$best,'attempted'=>(bool)$best]);
            });
        return response()->json($quizzes);
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
        $lb = QuizAttempt::select('user_id',\Illuminate\Support\Facades\DB::raw('count(*) as quizzes_taken'),\Illuminate\Support\Facades\DB::raw('avg(score) as avg_score'),\Illuminate\Support\Facades\DB::raw('max(score) as best_score'),\Illuminate\Support\Facades\DB::raw('sum(case when passed=1 then 1 else 0 end)*10 as points'))
            ->with('user:id,name,initials')
            ->groupBy('user_id')->orderByDesc('points')->limit(10)->get();
        return response()->json($lb);
    }
    public function certificates(Request $request) {
        return response()->json(Certificate::where('user_id',$request->user()->id)->with('course:id,title')->get());
    }
}
