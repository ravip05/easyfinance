<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Department extends Model {
    protected $fillable = ['name','head_user_id','is_active'];
    public function head() { return $this->belongsTo(User::class,'head_user_id'); }
}