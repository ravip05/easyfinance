<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Commission extends Model {
    protected $fillable = ['user_id','lead_id','loan_type','disbursed_amount','rate','amount','status','payout_date'];
    protected $casts = ['disbursed_amount'=>'decimal:2','amount'=>'decimal:2','payout_date'=>'date'];
    public function user() { return $this->belongsTo(User::class); }
    public function lead() { return $this->belongsTo(Lead::class); }
}