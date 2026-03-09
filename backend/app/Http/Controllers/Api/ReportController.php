<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Commission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller {
    public function leads(Request $request) {
        $q = Lead::query();
        if ($from = $request->from) $q->whereDate('created_at','>=',$from);
        if ($to   = $request->to)   $q->whereDate('created_at','<=',$to);
        $byStage = (clone $q)->select('stage',DB::raw('count(*) as count'))->groupBy('stage')->get();
        $byType  = (clone $q)->select('loan_type',DB::raw('count(*) as count'),DB::raw('sum(loan_amount) as total'))->groupBy('loan_type')->get();
        return response()->json(['by_stage'=>$byStage,'by_type'=>$byType,'total'=>$q->count()]);
    }
    public function disbursement(Request $request) {
        $q = Lead::where('stage','Disbursement');
        if ($from = $request->from) $q->whereDate('created_at','>=',$from);
        if ($to   = $request->to)   $q->whereDate('created_at','<=',$to);
        return response()->json(['total_leads'=>$q->count(),'total_amount'=>$q->sum('loan_amount'),'by_type'=>$q->select('loan_type',DB::raw('count(*) as count'),DB::raw('sum(loan_amount) as total'))->groupBy('loan_type')->get()]);
    }
    public function commission(Request $request) {
        return response()->json(Commission::with('user:id,name,initials','lead:id,name,loan_type')->orderByDesc('created_at')->paginate(20));
    }
    public function export(Request $request) {
        $leads = Lead::with('assignedUser:id,name')->get(['id','name','phone','loan_type','loan_amount','stage','priority','created_at']);
        $csv = "ID,Name,Phone,Loan Type,Amount,Stage,Priority,Created\n";
        foreach ($leads as $l) {
            $csv .= "\"{$l->id}\",\"{$l->name}\",\"{$l->phone}\",\"{$l->loan_type}\",\"{$l->loan_amount}\",\"{$l->stage}\",\"{$l->priority}\",\"{$l->created_at}\"\n";
        }
        return response($csv,200,['Content-Type'=>'text/csv','Content-Disposition'=>'attachment; filename="leads_export.csv"']);
    }
}
