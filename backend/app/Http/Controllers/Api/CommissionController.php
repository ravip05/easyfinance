<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use App\Models\CommissionSlab;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommissionController extends Controller {

    public function myCommission(Request $request) {
        $user = $request->user();
        return response()->json($this->calculateUserCommission($user));
    }

    public function staffPerformance(Request $request) {
        $users = User::whereIn('role', ['staff', 'manager', 'dsa'])->get();
        $performance = $users->map(function($u) {
            $stats = $this->calculateUserCommission($u);
            return array_merge(['user_id' => $u->id, 'user_name' => $u->name, 'role' => $u->role], $stats);
        });
        return response()->json($performance);
    }

    private function calculateUserCommission($user) {
        $leads = Lead::where('stage', 'Disbursed');
        
        // Filter based on role as per Lead::forUser scope logic
        if ($user->role === 'staff') {
            $leads->where('assigned_to', $user->id);
        } elseif ($user->role === 'dsa') {
            $leads->where('franchise_id', $user->franchise_id);
        } elseif ($user->role === 'manager') {
            $teamIds = $user->teamMembers()->pluck('id')->push($user->id);
            $leads->whereIn('assigned_to', $teamIds);
        } else {
            // Admins see all for themselves? Usually Admins don't get individual commission
            // but we'll return based on their direct assignments if any.
            $leads->where('assigned_to', $user->id);
        }

        $disbursedLeads = $leads->get();
        $totalAmount = $disbursedLeads->sum('amount');
        $totalCommission = 0;

        // Fetch slabs once for efficiency
        $slabs = CommissionSlab::where('role', $user->role)
                              ->orWhere('role', 'All')
                              ->get();

        $details = $disbursedLeads->map(function($l) use($slabs, &$totalCommission) {
            $slab = $slabs->where('loan_type', $l->loan_type)->first() 
                 ?? $slabs->where('loan_type', 'All')->first();
            
            $rate = $slab ? $slab->rate : 0;
            $earned = $l->amount * ($rate / 100);
            $totalCommission += $earned;

            return [
                'lead_id' => $l->id,
                'lead_name' => $l->name,
                'loan_type' => $l->loan_type,
                'amount' => $l->amount,
                'rate' => $rate,
                'earned' => $earned,
                'date' => $l->updated_at->format('Y-m-d')
            ];
        });

        return [
            'total_disbursed' => $totalAmount,
            'total_earned' => $totalCommission,
            'lead_count' => $disbursedLeads->count(),
            'history' => $details
        ];
    }
}
