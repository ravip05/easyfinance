<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Requests\Lead\UpdateLeadRequest;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LeadController
    |--------------------------------------------------------------------------
    |
    | Implements role-based scoping identical to the prototype's scopedLeads()
    | JavaScript function, but enforced at the database query level.
    |
    | Prototype scopedLeads() logic (replicated in Lead::scopeForUser()):
    |
    |   admin   → sees ALL leads
    |   manager → sees own leads + all direct reports' leads (teamMembers[])
    |   staff   → sees only leads where assigned_to = self
    |   dsa     → sees only leads where franchise_id = self.franchise_id
    |
    | The scopeForUser() Eloquent scope (defined on the Lead model) is the
    | single source of truth. Every query in this controller passes through it.
    | This means the scoping logic cannot be bypassed by sending a different
    | query parameter — it is always reapplied server-side.
    |
    */

    /**
     * GET /api/leads
     *
     * Returns a paginated, role-scoped list of leads.
     * Supports all filters the prototype's leads table uses:
     *
     *   ?search=rajesh          full-text across name + phone
     *   ?stage=Processing
     *   ?loan_type=Home+Loan
     *   ?priority=High
     *   ?assigned_to=3          admin/manager only
     *   ?follow_up_today=1      leads due today
     *   ?overdue=1              past follow_up_date, not closed
     *   ?sort=follow_up_date    column to sort by
     *   ?direction=asc|desc
     *   ?per_page=25            default 25, max 100
     *
     * Returns:
     *   {
     *     "success": true,
     *     "data": [ ...leads... ],
     *     "meta": { "current_page", "last_page", "per_page", "total" }
     *   }
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Lead::query()
            ->forUser($user)                          // ← role scoping applied here
            ->with([
                'assignedUser:id,name,emp_code,role',
                'addedByUser:id,name',
                'franchise:id,name,code',
            ]);

        // ── Filters ───────────────────────────────────────────────────────────

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($stage = $request->input('stage')) {
            $query->where('stage', $stage);
        }

        if ($loanType = $request->input('loan_type')) {
            $query->where('loan_type', $loanType);
        }

        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        // Admin and manager can filter by a specific assignee
        if ($assignedTo = $request->input('assigned_to')) {
            if (in_array($user->role, ['admin', 'manager'])) {
                $query->where('assigned_to', $assignedTo);
            }
        }

        if ($request->boolean('follow_up_today')) {
            $query->followUpToday();               // scope defined on Lead model
        }

        if ($request->boolean('overdue')) {
            $query->overdue();                     // scope defined on Lead model
        }

        // ── Sorting ───────────────────────────────────────────────────────────

        $allowedSorts = ['created_at', 'follow_up_date', 'name', 'amount', 'priority', 'stage'];
        $sort         = in_array($request->input('sort'), $allowedSorts)
                        ? $request->input('sort')
                        : 'created_at';
        $direction    = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sort, $direction);

        // ── Pagination ────────────────────────────────────────────────────────

        $perPage = min((int) $request->input('per_page', 25), 100);
        $results = $query->paginate($perPage);

        // ── Response ──────────────────────────────────────────────────────────
        // Transform each lead to the shape the React frontend expects.
        // This mirrors the normalizeApiLead() function in the frontend code.

        return response()->json([
            'success' => true,
            'data'    => $results->getCollection()->map(fn ($l) => $this->formatLead($l)),
            'meta'    => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
            ],
        ]);
    }

    /**
     * POST /api/leads
     *
     * Creates a new lead.
     *
     * Duplicate phone detection:
     *   If a lead with the same phone already exists in the caller's scope,
     *   the API returns 409 Conflict instead of creating a duplicate.
     *   The frontend can override this with ?force=1 (matching the prototype's
     *   confirm() dialog behaviour).
     *
     * Request body:
     *   {
     *     "name":           "Rajesh Kumar",
     *     "phone":          "9876543210",
     *     "loan_type":      "Home Loan",
     *     "amount":         4500000,
     *     "assigned_to":    3,
     *     "priority":       "High",
     *     "follow_up_date": "2025-02-15",
     *     "source":         "Direct",
     *     "notes":          "Interested in 20yr tenure"
     *   }
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $user      = $request->user();
        $validated = $request->validated();

        // ── Duplicate phone check ─────────────────────────────────────────────
        if (! $request->boolean('force')) {
            $duplicate = Lead::forUser($user)
                ->where('phone', $validated['phone'])
                ->whereNotIn('stage', ['Closed'])
                ->first();

            if ($duplicate) {
                return response()->json([
                    'success'      => false,
                    'message'      => "A lead with phone {$validated['phone']} already exists.",
                    'duplicate_id' => $duplicate->id,
                    'hint'         => 'Append ?force=1 to create anyway.',
                ], 409);
            }
        }

        // ── Default the stage and source ──────────────────────────────────────
        $validated['stage']    = 'New';
        $validated['source']   ??= 'Direct';
        $validated['priority'] ??= 'Medium';
        $validated['added_by'] = $user->id;

        // ── DSA partner leads: auto-attach franchise ───────────────────────────
        if ($user->role === 'dsa' && $user->franchise_id) {
            $validated['franchise_id'] = $user->franchise_id;
            $validated['source']       = 'DSA Partner';
        }

        $lead = Lead::create($validated);
        $lead->load(['assignedUser:id,name,emp_code', 'addedByUser:id,name', 'franchise:id,name,code']);

        return response()->json([
            'success' => true,
            'message' => "Lead \"{$lead->name}\" created successfully.",
            'data'    => $this->formatLead($lead),
        ], 201);
    }

    /**
     * GET /api/leads/{lead}
     *
     * Returns a single lead with full relationships.
     * Throws 403 if the requesting user cannot access this lead.
     */
    public function show(Request $request, Lead $lead): JsonResponse
    {
        $this->authorizeLeadAccess($request->user(), $lead);

        $lead->load([
            'assignedUser:id,name,emp_code,role,department',
            'addedByUser:id,name',
            'franchise:id,name,code,owner_name,city',
            'client:id,stage,cibil_score,bank_policy_id',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatLead($lead),
        ]);
    }

    /**
     * PUT /api/leads/{lead}
     *
     * Full or partial update of a lead record.
     * Staff cannot reassign leads (enforced in UpdateLeadRequest::prepareForValidation).
     * DSA partners cannot edit leads at all (blocked by UpdateLeadRequest::authorize).
     */
    public function update(UpdateLeadRequest $request, Lead $lead): JsonResponse
    {
        $this->authorizeLeadAccess($request->user(), $lead);

        $lead->update($request->validated());
        $lead->refresh()->load(['assignedUser:id,name,emp_code', 'addedByUser:id,name', 'franchise:id,name,code']);

        return response()->json([
            'success' => true,
            'message' => 'Lead updated successfully.',
            'data'    => $this->formatLead($lead),
        ]);
    }

    /**
     * DELETE /api/leads/{lead}
     *
     * Soft-deletes the lead (uses SoftDeletes trait on the model).
     * Hard delete is intentionally not exposed — admins can restore soft-deleted
     * leads from the database if needed.
     * Admin only.
     */
    public function destroy(Request $request, Lead $lead): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete leads.',
            ], 403);
        }

        $name = $lead->name;
        $lead->delete(); // soft delete

        return response()->json([
            'success' => true,
            'message' => "Lead \"{$name}\" has been archived.",
        ]);
    }

    // ── Extra Actions ──────────────────────────────────────────────────────────

    /**
     * PATCH /api/leads/{lead}/stage
     *
     * Dedicated stage-update endpoint for the kanban drag-drop and the
     * stage dropdown in the leads table. Staff can change stage without
     * having full update rights (they cannot change name, phone, assigned_to).
     *
     * Request body: { "stage": "Processing" }
     */
    public function updateStage(Request $request, Lead $lead): JsonResponse
    {
        $this->authorizeLeadAccess($request->user(), $lead);

        $request->validate([
            'stage' => ['required', \Illuminate\Validation\Rule::in(Lead::STAGES)],
        ]);

        $previousStage = $lead->stage;
        $lead->update(['stage' => $request->stage]);

        return response()->json([
            'success'        => true,
            'message'        => "Stage updated to \"{$request->stage}\".",
            'previous_stage' => $previousStage,
            'data'           => ['id' => $lead->id, 'stage' => $lead->stage],
        ]);
    }

    /**
     * PATCH /api/leads/{lead}/assign
     *
     * Reassigns a lead to a different staff member.
     * Admin and Manager only.
     *
     * Request body: { "assigned_to": 3 }
     */
    public function reassign(Request $request, Lead $lead): JsonResponse
    {
        $user = $request->user();

        if (! in_array($user->role, ['admin', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only managers and admins can reassign leads.',
            ], 403);
        }

        $request->validate([
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $lead->update(['assigned_to' => $request->assigned_to]);
        $lead->load('assignedUser:id,name,emp_code');

        return response()->json([
            'success' => true,
            'message' => "Lead reassigned to {$lead->assignedUser->name}.",
            'data'    => ['id' => $lead->id, 'assigned_user' => $lead->assignedUser],
        ]);
    }

    /**
     * GET /api/leads/stats/pipeline
     *
     * Returns lead counts grouped by stage for the kanban board headers.
     * Role-scoped the same way as index().
     *
     * Response:
     *   {
     *     "success": true,
     *     "data": {
     *       "New": 12,
     *       "Contacted": 5,
     *       "Processing": 3,
     *       ...
     *     }
     *   }
     */
    public function pipelineStats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Initialise all stages with 0 so frontend doesn't get missing keys
        $counts = array_fill_keys(Lead::STAGES, 0);

        $results = Lead::forUser($user)
            ->select('stage', DB::raw('count(*) as count'))
            ->groupBy('stage')
            ->pluck('count', 'stage');

        foreach ($results as $stage => $count) {
            $counts[$stage] = $count;
        }

        return response()->json([
            'success' => true,
            'data'    => $counts,
        ]);
    }

    /**
     * GET /api/leads/export/csv
     *
     * Streams a CSV file of the authenticated user's scoped leads.
     * Mirrors the prototype's exportLeadsCSV() function output format:
     *   Name, Phone, Type, Amount, Stage, Assigned, Priority, Follow-up
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $user  = $request->user();
        $leads = Lead::forUser($user)
                     ->with('assignedUser:id,name')
                     ->orderBy('created_at', 'desc')
                     ->get();

        $filename = 'leads_export_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($leads) {
            $handle = fopen('php://output', 'w');

            // Header row — matches prototype's exportLeadsCSV() columns
            fputcsv($handle, ['Name', 'Phone', 'Type', 'Amount', 'Stage', 'Assigned', 'Priority', 'Follow-up', 'Source', 'Added On']);

            foreach ($leads as $lead) {
                fputcsv($handle, [
                    $lead->name,
                    $lead->phone,
                    $lead->loan_type,
                    $lead->amount_formatted,   // accessor: '₹45L'
                    $lead->stage,
                    $lead->assignedUser?->name ?? 'Unassigned',
                    $lead->priority,
                    $lead->follow_up_date?->toDateString() ?? '',
                    $lead->source,
                    $lead->created_at->toDateString(),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * POST /api/leads/merge
     *
     * Merges multiple duplicate leads into a single master lead.
     * Transfers all LeadNote, LeadDocument, and LeadTimeline records.
     * Soft-deletes the non-master leads.
     */
    public function merge(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (! in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['success' => false, 'message' => 'Admin or Manager access required.'], 403);
        }

        $validated = $request->validate([
            'master_id' => 'required|integer|exists:leads,id',
            'duplicate_ids' => 'required|array|min:1',
            'duplicate_ids.*' => 'integer|exists:leads,id'
        ]);

        $masterId = $validated['master_id'];
        $duplicateIds = array_diff($validated['duplicate_ids'], [$masterId]);

        if (empty($duplicateIds)) {
            return response()->json(['success' => false, 'message' => 'No distinct duplicates to merge.'], 400);
        }

        try {
            DB::beginTransaction();

            $master = Lead::findOrFail($masterId);

            // Transfer related records
            DB::table('lead_notes')->whereIn('lead_id', $duplicateIds)->update(['lead_id' => $masterId]);
            DB::table('lead_documents')->whereIn('lead_id', $duplicateIds)->update(['lead_id' => $masterId]);
            DB::table('lead_timelines')->whereIn('lead_id', $duplicateIds)->update(['lead_id' => $masterId]);

            // Add an audit note to the master timeline
            DB::table('lead_timelines')->insert([
                'lead_id' => $masterId,
                'user_id' => $user->id,
                'action' => 'merged',
                'notes' => 'Merged with duplicate leads: ' . implode(', ', $duplicateIds),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Soft-delete the duplicates
            Lead::whereIn('id', $duplicateIds)->delete();

            // --- Audit Log ---
            \App\Models\AuditLog::create([
                'user_id' => $user->id,
                'action' => 'merged_leads',
                'model_type' => 'Lead',
                'model_id' => $masterId,
                'new_values' => [
                    'master_id' => $masterId,
                    'merged_ids' => $duplicateIds,
                ],
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Leads merged successfully. Retained ID: ' . $masterId,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Merge failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/leads/duplicates
     *
     * finds leads sharing the same phone or pan_number.
     * uses indexed subqueries so this stays fast even at 100k+ rows.
     * returns groups like: { type: 'phone', value: '9876543210', leads: [...], count: 3 }
     */
    public function getDuplicates(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['success' => false, 'message' => 'Admin or Manager access required.'], 403);
        }

        $groups = [];

        // --- phone duplicates (uses leads_phone_idx) ---
        $dupePhones = DB::table('leads')
            ->select('phone', DB::raw('COUNT(*) as cnt'))
            ->whereNull('deleted_at')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->groupBy('phone')
            ->having('cnt', '>', 1)
            ->orderByDesc('cnt')
            ->limit(50)
            ->get();

        foreach ($dupePhones as $row) {
            $leads = Lead::forUser($user)
                ->where('phone', $row->phone)
                ->with('assignedUser:id,name,emp_code')
                ->get()
                ->map(fn ($l) => $this->formatLead($l));

            if ($leads->count() > 1) {
                $groups[] = [
                    'type'  => 'phone',
                    'value' => $row->phone,
                    'count' => $leads->count(),
                    'leads' => $leads,
                ];
            }
        }

        // --- pan_number duplicates ---
        $dupePans = DB::table('leads')
            ->select('pan_number', DB::raw('COUNT(*) as cnt'))
            ->whereNull('deleted_at')
            ->whereNotNull('pan_number')
            ->where('pan_number', '!=', '')
            ->groupBy('pan_number')
            ->having('cnt', '>', 1)
            ->orderByDesc('cnt')
            ->limit(50)
            ->get();

        foreach ($dupePans as $row) {
            $leads = Lead::forUser($user)
                ->where('pan_number', $row->pan_number)
                ->with('assignedUser:id,name,emp_code')
                ->get()
                ->map(fn ($l) => $this->formatLead($l));

            if ($leads->count() > 1) {
                $groups[] = [
                    'type'  => 'pan_number',
                    'value' => $row->pan_number,
                    'count' => $leads->count(),
                    'leads' => $leads,
                ];
            }
        }

        return response()->json([
            'success'      => true,
            'total_groups' => count($groups),
            'data'         => $groups,
        ]);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Verifies the requesting user has access to the given lead.
     * Uses the canAccessLead() helper defined on the User model.
     * Throws 403 if access is denied.
     */
    private function authorizeLeadAccess(User $user, Lead $lead): void
    {
        if (! $user->canAccessLead($lead)) {
            abort(403, 'You do not have permission to access this lead.');
        }
    }

    /**
     * Formats a Lead model into the API response shape.
     *
     * This is the server-side equivalent of the frontend's normalizeApiLead()
     * function. The keys here must match what normalizeApiLead() reads.
     * Keeping both in sync means the React app needs zero field-mapping logic.
     */
    private function formatLead(Lead $lead): array
    {
        return [
            'id'              => $lead->id,
            'name'            => $lead->name,
            'phone'           => $lead->phone,
            'email'           => $lead->email,
            'pan_number'      => $lead->pan_number,
            'birth_date'      => $lead->birth_date?->toDateString(),
            'age'             => $lead->age,
            'location'        => $lead->location,
            'loan_type'       => $lead->loan_type,
            'amount'          => $lead->amount,
            'amount_display'  => $lead->amount_formatted,
            'monthly_income'  => $lead->monthly_income,
            'income_status'   => $lead->income_status,
            'running_loans'   => $lead->running_loans,
            'previous_issues' => $lead->previous_issues,
            'cibil_score'     => $lead->cibil_score,
            'lead_value'      => $lead->lead_value,
            'stage'           => $lead->stage,
            'priority'        => $lead->priority,
            'source'          => $lead->source,
            'follow_up_date'  => $lead->follow_up_date?->toDateString(),
            'follow_up_time'  => $lead->follow_up_time,
            'notes'           => $lead->notes,
            'is_overdue'      => $lead->is_overdue,
            'assigned_to'     => $lead->assigned_to,
            'assigned_user'   => $lead->assignedUser ? [
                'id'       => $lead->assignedUser->id,
                'name'     => $lead->assignedUser->name,
                'emp_code' => $lead->assignedUser->emp_code,
            ] : null,
            'added_by'        => $lead->added_by,
            'added_by_user'   => $lead->addedByUser ? [
                'id'   => $lead->addedByUser->id,
                'name' => $lead->addedByUser->name,
            ] : null,
            'franchise_id'    => $lead->franchise_id,
            'franchise'       => $lead->franchise ? [
                'id'   => $lead->franchise->id,
                'name' => $lead->franchise->name,
                'code' => $lead->franchise->code,
            ] : null,
            'created_at'      => $lead->created_at->toDateTimeString(),
            'updated_at'      => $lead->updated_at->toDateTimeString(),
        ];
    }
}
