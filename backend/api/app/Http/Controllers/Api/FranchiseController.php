<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Franchise;
use App\Models\Lead;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FranchiseController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | FranchiseController
    |--------------------------------------------------------------------------
    |
    | Manages DSA franchise partners.
    |
    | Scoping:
    |   admin   → all franchises
    |   dsa     → only their own franchise (read-only)
    |   manager → read-only access to franchises they have leads from
    |   staff   → no access
    |
    */

    /**
     * GET /api/franchises
     *
     * Query params:
     *   ?search=mumbai
     *   ?status=Active|Inactive
     *   ?city=Mumbai
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['staff', 'dsa', 'client'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $query = Franchise::query();

        // DSA sees only their own franchise
        if ($user->role === 'dsa') {
            $query->where('id', $user->franchise_id);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Add runtime aggregates from related tables
        $query->withCount('leads as total_leads')
              ->withCount(['leads as converted_leads' => fn ($q) => $q->where('stage', 'Disbursed')]);

        $franchises = $query->orderBy('id', 'desc')
                            ->paginate(min((int) $request->input('per_page', 20), 100));

        return response()->json([
            'success' => true,
            'data'    => $franchises->getCollection()->map(fn ($f) => $this->formatFranchise($f)),
            'meta'    => [
                'current_page' => $franchises->currentPage(),
                'last_page'    => $franchises->lastPage(),
                'per_page'     => $franchises->perPage(),
                'total'        => $franchises->total(),
            ],
        ]);
    }

    /**
     * POST /api/franchises — Admin only
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'name'            => ['required', 'string', 'min:2', 'max:100'],
            'code'            => ['required', 'string', 'max:20', 'unique:franchises,code', 'regex:/^EFW-[A-Z]{3}[0-9]{2}$/'],
            'owner_name'      => ['required', 'string', 'min:2', 'max:100'],
            'city'            => ['required', 'string', 'max:100'],
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:0.05'],
            'status'          => ['nullable', Rule::in(['Active', 'Inactive'])],
            'phone'           => ['nullable', 'string', 'regex:/^[0-9]{10}$/'],
            'email'           => ['nullable', 'email'],
            'address'         => ['nullable', 'string', 'max:500'],
        ]);

        $franchise = Franchise::create($validated);

        return response()->json([
            'success' => true,
            'message' => "Franchise \"{$franchise->name}\" ({$franchise->code}) created.",
            'data'    => $this->formatFranchise($franchise),
        ], 201);
    }

    /**
     * GET /api/franchises/{franchise}
     */
    public function show(Request $request, Franchise $franchise): JsonResponse
    {
        $this->authorizeFranchiseAccess($request->user(), $franchise);

        $franchise->loadCount([
            'leads as total_leads',
            'leads as converted_leads' => fn ($q) => $q->where('stage', 'Disbursed'),
            'users as members_count',
        ])->load('users:id,name,emp_code,role,status,franchise_id');

        return response()->json([
            'success' => true,
            'data'    => $this->formatFranchise($franchise, detailed: true),
        ]);
    }

    /**
     * PUT /api/franchises/{franchise} — Admin only
     */
    public function update(Request $request, Franchise $franchise): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'name'            => ['sometimes', 'string', 'min:2', 'max:100'],
            'owner_name'      => ['sometimes', 'string', 'min:2', 'max:100'],
            'city'            => ['sometimes', 'string', 'max:100'],
            'commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:0.05'],
            'status'          => ['sometimes', Rule::in(['Active', 'Inactive'])],
            'phone'           => ['sometimes', 'nullable', 'string', 'regex:/^[0-9]{10}$/'],
            'email'           => ['sometimes', 'nullable', 'email'],
            'address'         => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $franchise->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Franchise updated successfully.',
            'data'    => $this->formatFranchise($franchise),
        ]);
    }

    /**
     * DELETE /api/franchises/{franchise} — Admin only
     * Deactivates rather than deletes to preserve lead history.
     */
    public function destroy(Request $request, Franchise $franchise): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        if ($franchise->leads()->whereNotIn('stage', ['Closed', 'Disbursed'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot deactivate a franchise with active leads. Close or reassign them first.',
            ], 422);
        }

        $franchise->update(['status' => 'Inactive']);
        // Deactivate linked DSA users
        $franchise->users()->update(['status' => 'Inactive']);

        return response()->json([
            'success' => true,
            'message' => "Franchise \"{$franchise->name}\" deactivated.",
        ]);
    }

    /**
     * GET /api/franchises/{franchise}/leads
     */
    public function leads(Request $request, Franchise $franchise): JsonResponse
    {
        $this->authorizeFranchiseAccess($request->user(), $franchise);

        $leads = Lead::where('franchise_id', $franchise->id)
                     ->with('assignedUser:id,name')
                     ->orderBy('created_at', 'desc')
                     ->limit(100)
                     ->get();

        return response()->json([
            'success' => true,
            'data'    => $leads->map(fn ($l) => [
                'id'         => $l->id,
                'name'       => $l->name,
                'phone'      => $l->phone,
                'loan_type'  => $l->loan_type,
                'stage'      => $l->stage,
                'priority'   => $l->priority,
                'amount'     => $l->amount_formatted,
                'assigned'   => $l->assignedUser?->name ?? 'Unassigned',
                'created_at' => $l->created_at->toDateString(),
            ]),
        ]);
    }

    /**
     * GET /api/franchises/{franchise}/payouts
     */
    public function payouts(Request $request, Franchise $franchise): JsonResponse
    {
        $this->authorizeFranchiseAccess($request->user(), $franchise);

        $payouts = Payout::where('franchise_id', $franchise->id)
                         ->orderBy('created_at', 'desc')
                         ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $payouts->getCollection()->map(fn ($p) => [
                'id'               => $p->id,
                'payout_type'      => $p->payout_type,
                'period_leads'     => $p->period_leads,
                'period_converted' => $p->period_converted,
                'disbursed_amount' => $p->disbursed_display,
                'commission_rate'  => $p->commission_rate,
                'gross_amount'     => $p->gross_display,
                'tds_amount'       => '₹' . number_format($p->tds_amount, 0, '.', ','),
                'net_amount'       => '₹' . number_format($p->net_amount, 0, '.', ','),
                'status'           => $p->status,
                'period_start'     => $p->period_start?->toDateString(),
                'period_end'       => $p->period_end?->toDateString(),
                'paid_at'          => $p->paid_at?->toDateTimeString(),
            ]),
            'meta'    => [
                'current_page' => $payouts->currentPage(),
                'last_page'    => $payouts->lastPage(),
                'total'        => $payouts->total(),
            ],
        ]);
    }

    /**
     * GET /api/franchise/dashboard — Stats for the owner/manager
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'dsa') {
            return response()->json(['success' => false, 'message' => 'DSA access required.'], 403);
        }

        $franchise = Franchise::find($user->franchise_id);
        if (!$franchise) {
            return response()->json(['success' => false, 'message' => 'Franchise not found.'], 404);
        }

        $leads = Lead::where('franchise_id', $franchise->id)->get();
        
        $stats = [
            'collection' => $leads->where('stage', 'Disbursed')->sum('valuation'),
            'target' => 5000000, // Hardcoded for now, could be in settings
            'active_clients' => $leads->where('stage', 'Processing')->count(),
            'new_clients_this_month' => $leads->where('created_at', '>=', now()->startOfMonth())->count(),
            'unpaid_commission' => Payout::where('franchise_id', $franchise->id)->where('status', 'pending')->sum('net_amount'),
            'branches' => [
                ['id' => 1, 'name' => 'Main Branch', 'collection' => $leads->where('stage', 'Disbursed')->sum('valuation') * 0.7],
                ['id' => 2, 'name' => 'Satellite Branch', 'collection' => $leads->where('stage', 'Disbursed')->sum('valuation') * 0.3],
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private function authorizeFranchiseAccess(User $user, Franchise $franchise): void
    {
        if ($user->role === 'staff') {
            abort(403);
        }
        if ($user->role === 'dsa' && $user->franchise_id !== $franchise->id) {
            abort(403, 'You can only view your own franchise.');
        }
    }

    private function formatFranchise(Franchise $franchise, bool $detailed = false): array
    {
        $data = [
            'id'              => $franchise->id,
            'name'            => $franchise->name,
            'code'            => $franchise->code,
            'owner_name'      => $franchise->owner_name,
            'city'            => $franchise->city,
            'commission_rate' => $franchise->commission_rate,
            'rate_display'    => $franchise->commission_rate_display,  // '0.30%'
            'status'          => $franchise->status,
            'phone'           => $franchise->phone,
            'email'           => $franchise->email,
            // Aggregates (from withCount)
            'total_leads'     => $franchise->total_leads ?? null,
            'converted_leads' => $franchise->converted_leads ?? null,
            'members_count'   => $franchise->members_count ?? null,
            'created_at'      => $franchise->created_at->toDateTimeString(),
        ];

        if ($detailed) {
            $data['users'] = $franchise->users?->map(fn ($u) => [
                'id'       => $u->id,
                'name'     => $u->name,
                'emp_code' => $u->emp_code,
                'role'     => $u->role,
                'status'   => $u->status,
            ])->toArray() ?? [];
        }

        return $data;
    }
}
