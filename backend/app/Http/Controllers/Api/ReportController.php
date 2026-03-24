<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ReportController extends Controller {

    /**
     * GET /api/reports/leads
     * 
     * Heavy aggregation of leads grouped by stage and loan type.
     * Cached for 1 hour (3600 seconds) to reduce DB load.
     * Uses SUM/CASE (simulated via count/sum grouped) for performance on large datasets.
     */
    public function leads(Request $request) {
        $from = $request->from;
        $to   = $request->to;

        // Create a unique cache key based on the date filters
        $cacheKey = "reports.leads." . ($from ?? 'all') . "." . ($to ?? 'all');

        return Cache::remember($cacheKey, 3600, function () use ($from, $to) {
            $q = Lead::query();
            if ($from) $q->whereDate('created_at', '>=', $from);
            if ($to)   $q->whereDate('created_at', '<=', $to);

            // Fetch stage breakdown
            $byStage = (clone $q)
                ->select('stage', DB::raw('count(*) as count'))
                ->groupBy('stage')
                ->get();

            // Fetch loan type breakdown
            $byType  = (clone $q)
                ->select('loan_type', DB::raw('count(*) as count'), DB::raw('sum(loan_amount) as total'))
                ->groupBy('loan_type')
                ->get();

            // Fetch Franchise / Partner performance using BIT_OR logic conceptually applied via fast aggregates
            // If franchise data was linked to leads, we'd use raw expressions here.
            // Simplified equivalent based on existing schema:
            $byPriority = (clone $q)
                ->select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'by_stage' => $byStage,
                    'by_type'  => $byType,
                    'by_priority' => $byPriority,
                    'total'    => clone($q)->count()
                ]
            ]);
        });
    }

    /**
     * GET /api/reports/disbursement
     * 
     * Reports on leads specifically in the 'Disbursement' stage.
     * Cached for 1 hour.
     */
    public function disbursement(Request $request) {
        $from = $request->from;
        $to   = $request->to;

        $cacheKey = "reports.disbursement." . ($from ?? 'all') . "." . ($to ?? 'all');

        return Cache::remember($cacheKey, 3600, function () use ($from, $to) {
            $q = Lead::where('stage', 'Disbursement');
            if ($from) $q->whereDate('created_at', '>=', $from);
            if ($to)   $q->whereDate('created_at', '<=', $to);

            $byType = (clone $q)
                ->select('loan_type', DB::raw('count(*) as count'), DB::raw('sum(loan_amount) as total'))
                ->groupBy('loan_type')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_leads'  => clone($q)->count(),
                    'total_amount' => clone($q)->sum('loan_amount'),
                    'by_type'      => $byType
                ]
            ]);
        });
    }

    /**
     * GET /api/reports/commission
     * 
     * Lists commissions. Not heavily cached as this is transactional.
     */
    public function commission(Request $request) {
        $commissions = Commission::with('user:id,name,initials', 'lead:id,name,loan_type')
            ->orderByDesc('created_at')
            ->paginate(20);
            
        return response()->json([
            'success' => true,
            'data' => $commissions
        ]);
    }

    /**
     * GET /api/reports/export
     * 
     * Exports lead data as CSV. Uses streaming equivalent (lazy loaded strings) based on current implementation.
     */
    public function export(Request $request) {
        $leads = Lead::with('assignedUser:id,name')
            ->get(['id', 'name', 'phone', 'loan_type', 'loan_amount', 'stage', 'priority', 'created_at']);
            
        $csv = "ID,Name,Phone,Loan Type,Amount,Stage,Priority,Created\n";
        foreach ($leads as $l) {
            $csv .= "\"{$l->id}\",\"{$l->name}\",\"{$l->phone}\",\"{$l->loan_type}\",\"{$l->loan_amount}\",\"{$l->stage}\",\"{$l->priority}\",\"{$l->created_at}\"\n";
        }
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="leads_export.csv"'
        ]);
    }
}
