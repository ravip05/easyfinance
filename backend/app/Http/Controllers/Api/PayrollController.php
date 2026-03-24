<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\PayrollLedgerEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayrollController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | PayrollController
    |--------------------------------------------------------------------------
    |
    | Atomic payroll processing with pessimistic locking.
    | Only admin and manager roles are allowed (enforced via route middleware).
    |
    | Security model:
    |   - lockForUpdate() prevents concurrent double-payment
    |   - DB::transaction() ensures all-or-nothing commit
    |   - Every payout generates an immutable ledger entry
    |   - Reference numbers are unique and sequential per batch
    |
    */

    /**
     * GET /api/payroll/summary
     *
     * Aggregated view of pending vs. approved vs. paid commissions.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Commission::query();

        // Managers see only their team's commissions
        if ($user->role === 'manager') {
            $teamIds = \App\Models\User::where('manager_id', $user->id)
                ->pluck('id')
                ->push($user->id);
            $query->whereIn('user_id', $teamIds);
        }

        $summary = $query
            ->select(
                'status',
                DB::raw('COUNT(*)              as count'),
                DB::raw('SUM(amount)           as total_amount'),
                DB::raw('SUM(disbursed_amount) as total_disbursed')
            )
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $pending  = $summary->get('pending');
        $approved = $summary->get('approved');
        $paid     = $summary->get('paid');

        return response()->json([
            'success' => true,
            'data'    => [
                'pending'  => [
                    'count'  => $pending->count ?? 0,
                    'amount' => $pending->total_amount ?? 0,
                ],
                'approved' => [
                    'count'  => $approved->count ?? 0,
                    'amount' => $approved->total_amount ?? 0,
                ],
                'paid'     => [
                    'count'           => $paid->count ?? 0,
                    'amount'          => $paid->total_amount ?? 0,
                    'total_disbursed' => $paid->total_disbursed ?? 0,
                ],
                'recent_ledger' => PayrollLedgerEntry::with('user:id,name', 'processor:id,name')
                    ->orderByDesc('created_at')
                    ->limit(10)
                    ->get(),
            ],
        ]);
    }

    /**
     * POST /api/payroll/process
     *
     * Atomically marks approved commissions as "paid" and generates
     * immutable ledger entries for each.
     *
     * Request body:
     *   { "commission_ids": [1, 2, 3], "notes": "March payout batch" }
     *
     * Security:
     *   - pessimistic row-level locking (SELECT … FOR UPDATE)
     *   - all commissions must be in "approved" status
     *   - entire batch rolls back on any single failure
     */
    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'commission_ids'   => ['required', 'array', 'min:1', 'max:100'],
            'commission_ids.*' => ['required', 'integer', 'exists:commissions,id'],
            'notes'            => ['nullable', 'string', 'max:500'],
        ]);

        $commissionIds = $request->input('commission_ids');
        $notes         = $request->input('notes');
        $processedBy   = $request->user()->id;

        try {
            $result = DB::transaction(function () use ($commissionIds, $notes, $processedBy) {

                // ── Step 1: Lock rows to prevent concurrent double-pay ────────
                $commissions = Commission::whereIn('id', $commissionIds)
                    ->lockForUpdate()
                    ->get();

                // ── Step 2: Validate every commission is in "approved" status ─
                $invalid = $commissions->filter(fn ($c) => $c->status !== 'approved');

                if ($invalid->isNotEmpty()) {
                    $detail = $invalid->map(fn ($c) => [
                        'id'     => $c->id,
                        'status' => $c->status,
                    ])->values();

                    throw ValidationException::withMessages([
                        'commission_ids' => "Commissions must be in 'approved' status. Invalid: " . $detail->toJson(),
                    ]);
                }

                // Verify we found all requested IDs (prevents silently skipping)
                if ($commissions->count() !== count($commissionIds)) {
                    $missing = array_diff($commissionIds, $commissions->pluck('id')->toArray());
                    throw ValidationException::withMessages([
                        'commission_ids' => 'Commission IDs not found: ' . implode(', ', $missing),
                    ]);
                }

                // ── Step 3: Generate unique reference number for this batch ───
                $datePart  = now()->format('Ymd');
                $batchBase = "PAY-{$datePart}";

                // Find the last reference for today to get the next sequence
                $lastRef = PayrollLedgerEntry::where('reference_number', 'like', "{$batchBase}-%")
                    ->orderByDesc('reference_number')
                    ->value('reference_number');

                $sequence = 1;
                if ($lastRef) {
                    $lastSeq  = (int) substr($lastRef, strrpos($lastRef, '-') + 1);
                    $sequence = $lastSeq + 1;
                }

                // ── Step 4: Mark as paid + create ledger entries ──────────────
                $now           = now();
                $ledgerEntries = [];

                foreach ($commissions as $commission) {
                    // Update commission status
                    $commission->update([
                        'status'      => 'paid',
                        'payout_date' => $now->toDateString(),
                    ]);

                    // Create immutable ledger entry
                    $refNumber = sprintf('%s-%04d', $batchBase, $sequence++);

                    $ledgerEntries[] = PayrollLedgerEntry::create([
                        'commission_id'    => $commission->id,
                        'user_id'          => $commission->user_id,
                        'amount'           => $commission->amount,
                        'processed_by'     => $processedBy,
                        'reference_number' => $refNumber,
                        'notes'            => $notes,
                    ]);
                }

                return $ledgerEntries;

            }, 3); // retry up to 3 times on deadlock

            return response()->json([
                'success' => true,
                'message' => count($result) . ' commission(s) marked as paid.',
                'data'    => [
                    'processed_count' => count($result),
                    'ledger_entries'  => $result,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Payroll processing failed. Transaction rolled back.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }
}
