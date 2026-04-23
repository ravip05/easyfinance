<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Department extends Model {
    protected $fillable = ['name','head_user_id','is_active','commission_rate','description','permissions'];
    protected function casts(): array { return ['commission_rate' => 'decimal:4', 'is_active' => 'boolean', 'permissions' => 'json']; }
    public function head() { return $this->belongsTo(User::class,'head_user_id'); }
    public function members() { return User::where('department', $this->name)->get(); }
}