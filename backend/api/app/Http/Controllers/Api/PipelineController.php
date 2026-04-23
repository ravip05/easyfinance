<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\PipelineStage;
use App\Models\LeadTimeline;
use Illuminate\Http\Request;

class PipelineController extends Controller {
    public function index(Request $request) {
        $user   = $request->user();
        $stages = PipelineStage::where('is_active',true)->orderBy('sort_order')->get();
        $leads  = Lead::scopeForUser(Lead::query(),$user)->with('assignedUser:id,name,initials')->get();
        $data   = $stages->map(fn($stage) => [
            'stage' => $stage->name,
            'color' => $stage->color,
            'leads' => $leads->where('stage',$stage->name)->values(),
        ]);
        return response()->json($data);
    }
    public function move(Request $request) {
        $lead = Lead::findOrFail($request->lead_id);
        $old  = $lead->stage;
        $lead->update(['stage'=>$request->stage]);
        LeadTimeline::create(['lead_id'=>$lead->id,'user_id'=>$request->user()->id,'action'=>'Stage Changed','from_stage'=>$old,'to_stage'=>$request->stage]);
        return response()->json($lead->fresh());
    }
}
