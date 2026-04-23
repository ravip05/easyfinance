<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Commission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller {
    public function stats(Request $request) {
        $user = $request->user();
        $q = Lead::forUser($user);
        
        $totalLeads = (clone $q)->count();
        $activeLeads = (clone $q)->whereNotIn('stage', ['Disbursed', 'Closed'])->count();
        $disbursedLeads = (clone $q)->where('stage', 'Disbursed')->count();
        $totalAmount = (clone $q)->where('stage', 'Disbursed')->sum('amount');
        
        // "All people in leads are our clients" - User Requirement
        $totalClients = $totalLeads; 
        
        $commission = Commission::where('user_id', $user->id)->sum('amount');

        // Monthly Profit Calculation
        // Assuming company revenue is approx 2% of total disbursed this month, minus staff payouts
        $monthlyDisbursed = clone $q;
        $monthlyDisbursedAmount = $monthlyDisbursed->where('stage', 'Disbursed')
            ->whereYear('updated_at', now()->year)
            ->whereMonth('updated_at', now()->month)
            ->sum('amount');
            
        $monthlyPayouts = \App\Models\Payout::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('net_amount');
            
        $monthlyProfit = max(0, ($monthlyDisbursedAmount * 0.02) - $monthlyPayouts);
        
        return response()->json([
            'total_leads'     => $totalLeads,
            'active_leads'    => $activeLeads,
            'disbursed_leads' => $disbursedLeads,
            'total_clients'   => $totalClients,
            'total_amount'    => $totalAmount,
            'my_commission'   => $commission,
            'monthly_profit'  => $monthlyProfit,
        ]);
    }
    public function trend(Request $request) {
        $user = $request->user();
        $months = collect(range(5,0,-1))->map(function($i) use($user) {
            $date = now()->subMonths($i);
            $q = Lead::forUser($user)
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            return [
                'month'    => $date->format('M'),
                'leads'    => (clone $q)->count(),
                'disbursed'=> (clone $q)->where('stage', 'Disbursed')->count(),
            ];
        });
        return response()->json($months);
    }
    public function pipelineSummary(Request $request) {
        $user = $request->user();
        $data = Lead::forUser($user)
            ->select('stage', DB::raw('count(*) as count'), DB::raw('sum(amount) as total_amount'))
            ->groupBy('stage')
            ->get();
        return response()->json($data);
    }
    public function followups(Request $request) {
        $user = $request->user();
        $today = now()->toDateString();
        $leads = Lead::forUser($user)
            ->whereNotNull('follow_up_date')
            ->whereNotIn('stage',['Closed'])
            ->orderBy('follow_up_date')
            ->limit(10)
            ->with('assignedUser:id,name,initials')
            ->get(['id','name','phone','loan_type','stage','follow_up_date','priority','assigned_to']);
        return response()->json($leads->map(fn($l) => array_merge($l->toArray(), [
            'status' => $l->follow_up_date < $today ? 'overdue' : ($l->follow_up_date == $today ? 'today' : 'upcoming')
        ])));
    }
    public function leaderboard(Request $request) {
        $lb = User::withCount(['leads as total_leads','leads as disbursed_leads' => fn($q) => $q->where('stage', 'Disbursed')])
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['staff', 'manager', 'dsa']))
            ->where('status', 'active')
            ->orderByDesc('disbursed_leads')
            ->limit(10)
            ->get(['id','name','initials','department'])
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'initials'   => $u->initials,
                'department' => $u->department,
                'total_leads'    => $u->total_leads,
                'disbursed_leads'=> $u->disbursed_leads,
            ]);
        return response()->json($lb);
    }
}
