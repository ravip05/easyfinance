<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LmsCourse extends Model {
    protected $fillable = ['title','description','thumbnail','category','level','duration_minutes','lesson_count','is_active','created_by','sort_order'];
    protected $casts = ['is_active'=>'boolean'];
    public function lessons()     { return $this->hasMany(LmsLesson::class,'course_id')->orderBy('sort_order'); }
    public function enrollments() { return $this->hasMany(CourseEnrollment::class,'course_id'); }
}