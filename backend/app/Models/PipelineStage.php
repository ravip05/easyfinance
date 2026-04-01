<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PipelineStage extends Model {
    protected $fillable = ['name','color','sort_order','is_active'];
}