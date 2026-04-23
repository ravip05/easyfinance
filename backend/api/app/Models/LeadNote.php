<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeadNote extends Model {
    protected $fillable = ['lead_id','user_id','content','type'];
    public function user() { return $this->belongsTo(User::class); }
}