<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CourseEnrollment extends Model {
    protected $fillable = ['user_id','course_id','progress','completed_at','last_lesson_id'];
    protected $casts = ['completed_at'=>'datetime'];
    public function user()   { return $this->belongsTo(User::class); }
    public function course() { return $this->belongsTo(LmsCourse::class); }
}