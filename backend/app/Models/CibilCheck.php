<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CibilCheck extends Model {
    protected $fillable = ['user_id','lead_id','client_id','checked_name','pan','score','rating','response_data'];
    protected $casts = ['response_data'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
}