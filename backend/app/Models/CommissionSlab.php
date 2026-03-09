<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CommissionSlab extends Model {
    protected $fillable = ['role','loan_type','rate','min_disbursement','is_active'];
    protected $casts = ['is_active'=>'boolean'];
}