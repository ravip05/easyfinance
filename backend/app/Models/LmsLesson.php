<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LmsLesson extends Model {
    protected $fillable = ['course_id','title','type','content','video_url','file_path','duration_minutes','sort_order'];
    public function course() { return $this->belongsTo(LmsCourse::class); }
}