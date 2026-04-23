<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ClientController
    |--------------------------------------------------------------------------
    |
    | A "Client" is a Lead that has been formally accepted into the loan
    | processing pipeline. The distinction in the prototype is visual — the
    | Clients tab shows converted leads with CIBIL scores and bank assignments.
    |
    | Role scoping mirrors the Lead scoping rules:
    |   admin   → all clients
    |   manager → own clients + team's clients
    |   staff   → only clients they manage (managed_by = self)
    |   dsa     → only clients from their franchise
    |
    */

    /**
     * GET /api/clients
     *
     * Role-scoped, filterable, paginated list of clients.
     *
     * Query params:
     *   ?search=rajesh
     *   ?stage=Login
     *   ?loan_type=Home+Loan
     *   ?cibil_min=700        filter by minimum CIBIL score
     *   ?cibil_max=800
     *   ?bank_policy_id=2
     *   ?managed_by=3         admin/manager only
     *   ?per_page=25
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Get all formal clients
        $clientsQuery = Client::query()
            ->forUser($user)
            ->with([
                'manager:id,name,emp_code,role',
                'bankPolicy:id,name,logo_code,brand_color',
                'franchise:id,name,code',
                'lead:id,stage,source,priority',
            ]);

        // 2. Filter logic for clients
        if ($search = $request->input('search')) {
            $clientsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $clients = $clientsQuery->get();

        // 3. Get all leads that are NOT yet formal clients
        $clientLeadIds = $clients->pluck('lead_id')->filter()->toArray();
        $leadsQuery = Lead::forUser($user)
            ->whereNotIn('id', $clientLeadIds)
            ->with(['assignedUser:id,name,emp_code', 'franchise:id,name,code']);

        if ($search = $request->input('search')) {
            $leadsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $leads = $leadsQuery->get();

        // 4. Merge and format
        $combined = $clients->map(fn($c) => $this->formatClient($c))
            ->concat($leads->map(fn($l) => [
                'id'             => 'lead-' . $l->id,
                'lead_id'        => $l->id,
                'name'           => $l->name,
                'phone'          => $l->phone,
                'email'          => $l->email,
                'loan_type'      => $l->loan_type,
                'amount'         => $l->amount,
                'amount_display' => $l->amount_formatted,
                'stage'          => $l->stage,
                'cibil_score'    => $l->cibil_score,
                'bank_policy'    => null, // leads don't have bank policies until conversion
                'emi_amount'     => null,
                'managed_by'     => $l->assigned_to,
                'manager'        => $l->assignedUser,
                'franchise'      => $l->franchise,
                'is_formal'      => false,
                'initials'       => $l->initials,
                'created_at'     => $l->created_at->toDateTimeString(),
            ]));

        // 5. Sort unified list
        $combined = $combined->sortByDesc('created_at')->values();

        // 6. Manual pagination
        $perPage = min((int) $request->input('per_page', 25), 100);
        $page = (int) $request->input('page', 1);
        $pagedData = $combined->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'success' => true,
            'data'    => $pagedData,
            'meta'    => [
                'current_page' => $page,
                'last_page'    => ceil($combined->count() / $perPage),
                'per_page'     => $perPage,
                'total'        => $combined->count(),
            ],
        ]);
    }

    /**
     * POST /api/clients
     *
     * Creates a new client record directly (not from a lead conversion).
     * Admin and Manager only — enforced in StoreClientRequest::authorize().
     */
    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Client::create($request->validated());
        $client->load(['manager:id,name,emp_code', 'bankPolicy:id,name', 'franchise:id,name,code']);

        return response()->json([
            'success' => true,
            'message' => "Client \"{$client->name}\" created successfully.",
            'data'    => $this->formatClient($client),
        ], 201);
    }

    /**
     * GET /api/clients/{client}
     */
    public function show(Request $request, Client $client): JsonResponse
    {
        $this->authorizeClientAccess($request->user(), $client);

        $client->load([
            'manager:id,name,emp_code,role,department',
            'bankPolicy',
            'franchise:id,name,code,owner_name,city',
            'lead:id,stage,source,priority,assigned_to,created_at',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatClient($client),
        ]);
    }

    /**
     * PUT /api/clients/{client}
     *
     * Updates a client record. Admin and Manager only.
     */
    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $this->authorizeClientAccess($request->user(), $client);

        if (! in_array($request->user()->role, ['admin', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only managers and admins can edit client records.',
            ], 403);
        }

        $validated = $request->validate([
            'name'                  => ['sometimes', 'string', 'min:2', 'max:100'],
            'phone'                 => ['sometimes', 'string', 'regex:/^[0-9]{10}$/'],
            'email'                 => ['sometimes', 'nullable', 'email'],
            'pan_number'            => ['sometimes', 'nullable', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'aadhaar_number'        => ['sometimes', 'nullable', 'string', 'digits:12'],
            'loan_type'             => ['sometimes', Rule::in(\App\Models\Lead::LOAN_TYPES)],
            'amount'                => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'monthly_income'        => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'emi_amount'            => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tenure_months'         => ['sometimes', 'nullable', 'integer', 'min:1', 'max:360'],
            'disbursed_at'          => ['sometimes', 'nullable', 'date'],
            'cibil_score'           => ['sometimes', 'nullable', 'integer', 'min:300', 'max:900'],
            'stage'                 => ['sometimes', Rule::in(Client::STAGES)],
            'bank_policy_id'        => ['sometimes', 'nullable', 'integer', 'exists:bank_policies,id'],
            'bank_reference_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'notes'                 => ['sometimes', 'nullable', 'string', 'max:2000'],
            'managed_by'            => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ]);

        $client->update($validated);
        $client->refresh()->load(['manager:id,name,emp_code', 'bankPolicy:id,name', 'franchise:id,name,code']);

        return response()->json([
            'success' => true,
            'message' => 'Client updated successfully.',
            'data'    => $this->formatClient($client),
        ]);
    }

    /**
     * DELETE /api/clients/{client}
     *
     * Soft-deletes a client record. Admin only.
     */
    public function destroy(Request $request, Client $client): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete client records.',
            ], 403);
        }

        $name = $client->name;
        $client->delete();

        return response()->json([
            'success' => true,
            'message' => "Client \"{$name}\" has been archived.",
        ]);
    }

    // ── Extra Actions ──────────────────────────────────────────────────────────

    /**
     * PATCH /api/clients/{client}/stage
     *
     * Updates the client's processing stage.
     * When stage is set to 'Disbursed', records the disbursed_at date.
     *
     * Request body: { "stage": "Sanctioned" }
     */
    public function updateStage(Request $request, Client $client): JsonResponse
    {
        $this->authorizeClientAccess($request->user(), $client);

        if (! in_array($request->user()->role, ['admin', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only managers and admins can update client stages.',
            ], 403);
        }

        $request->validate([
            'stage' => ['required', Rule::in(Client::STAGES)],
        ]);

        $previousStage = $client->stage;
        $updates = ['stage' => $request->stage];

        // Auto-stamp disbursed_at when the loan is marked disbursed
        if ($request->stage === 'Disbursed' && ! $client->disbursed_at) {
            $updates['disbursed_at'] = now()->toDateString();
        }

        $client->update($updates);

        return response()->json([
            'success'        => true,
            'message'        => "Client stage updated to \"{$request->stage}\".",
            'previous_stage' => $previousStage,
            'data'           => [
                'id'           => $client->id,
                'stage'        => $client->stage,
                'disbursed_at' => $client->disbursed_at ? (string)$client->disbursed_at : null,
            ],
        ]);
    }

    /**
     * POST /api/clients/from-lead/{lead}
     *
     * Converts an existing Lead into a Client in a single atomic transaction.
     * This is the "Convert to Client" button action in the leads table.
     *
     * What it does:
     *   1. Validates the lead is in a convertible stage (not already Closed/Disbursed)
     *   2. Creates a Client record pre-populated from the Lead's data
     *   3. Sets lead.stage = 'Disbursed' (or 'Closed') to remove it from active pipeline
     *   4. Links the Client back to the Lead via client.lead_id
     *
     * Additional body fields (optional):
     *   { "cibil_score": 740, "bank_policy_id": 2, "emi_amount": 38000 }
     */
    public function convertFromLead(Request $request, Lead $lead): JsonResponse
    {
        $this->authorizeLeadAccessForConversion($request->user(), $lead);

        // A lead can only be converted once
        if ($lead->client()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This lead has already been converted to a client.',
            ], 409);
        }

        $extra = $request->validate([
            'cibil_score'           => ['nullable', 'integer', 'min:300', 'max:900'],
            'bank_policy_id'        => ['nullable', 'integer', 'exists:bank_policies,id'],
            'emi_amount'            => ['nullable', 'numeric', 'min:0'],
            'tenure_months'         => ['nullable', 'integer', 'min:1', 'max:360'],
            'bank_reference_number' => ['nullable', 'string', 'max:50'],
            'notes'                 => ['nullable', 'string', 'max:2000'],
        ]);


        $client = DB::transaction(function () use ($lead, $extra, $request) {



            // Create client from lead data + any extra fields supplied
            $client = Client::create([
                'lead_id'               => $lead->id,
                'name'                  => $lead->name,
                'phone'                 => $lead->phone,
                'email'                 => $lead->email,
                'pan_number'            => $lead->pan_number,
                'loan_type'             => $lead->loan_type,
                'amount'                => $lead->amount,
                'monthly_income'        => $lead->monthly_income,
                'stage'                 => 'Docs Pending',       // start of client pipeline
                'managed_by'            => $lead->assigned_to ?? $request->user()->id,
                'franchise_id'          => $lead->franchise_id,
                'notes'                 => $lead->notes,

                // Merge extra fields from the request
                ...$extra,
            ]);

            // Move the lead out of the active pipeline
            $lead->update(['stage' => 'Disbursed']);

            // Create an audit log entry for this critical transition
            \App\Models\AuditLog::create([
                'user_id'    => $request->user()->id,
                'action'     => "Converted lead #{$lead->id} ({$lead->name}) to formal client",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return $client;
        });

        $client->load(['manager:id,name,emp_code', 'bankPolicy:id,name', 'franchise:id,name,code']);

        return response()->json([
            'success' => true,
            'message' => "Lead \"{$lead->name}\" successfully converted to a client.",
            'data'    => $this->formatClient($client),
        ], 201);
    }

    /**
     * GET /api/client/dashboard — Detailed progress for the client portal
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'Client access required.'], 403);
        }

        // A client sees lead data matching their phone
        $lead = Lead::where('phone', $user->phone)->first();
        if (!$lead) {
            return response()->json(['success' => false, 'message' => 'No active application found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'lead' => $lead,
                'stages' => [
                    ['id' => 'new', 'name' => 'New Application'],
                    ['id' => 'processing', 'name' => 'Loan Processing'],
                    ['id' => 'sanctioned', 'name' => 'Sanctioned'],
                    ['id' => 'disbursed', 'name' => 'Disbursed'],
                ],
                // Simplified document list for base UI
                'documents' => [
                    ['id' => 1, 'name' => 'Aadhar Card', 'type' => 'pdf', 'date' => '2024-03-10'],
                    ['id' => 2, 'name' => 'PAN Card Scan', 'type' => 'jpg', 'date' => '2024-03-10'],
                ]
            ]
        ]);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private function authorizeClientAccess(User $user, Client $client): void
    {
        $allowed = match ($user->role) {
            'admin'   => true,
            'manager' => $client->managed_by === $user->id
                         || $user->teamMembers()->pluck('id')->contains($client->managed_by),
            'staff'   => $client->managed_by === $user->id,
            'dsa'     => $client->franchise_id === $user->franchise_id,
            default   => false,
        };

        if (! $allowed) {
            abort(403, 'You do not have permission to access this client.');
        }
    }

    private function authorizeLeadAccessForConversion(User $user, Lead $lead): void
    {
        if (! in_array($user->role, ['admin', 'manager'])) {
            abort(403, 'Only managers and admins can convert leads to clients.');
        }

        // Use canAccessLead() to check the lead is in their scope
        if (! $user->canAccessLead($lead)) {
            abort(403, 'You do not have permission to access this lead.');
        }
    }

    /**
     * Formats a Client model into the standard API response shape.
     * The shape mirrors the prototype's CLIENTS array entries.
     */
    private function formatClient($client): array
    {
        return [
            'id'                    => $client->id,
            'lead_id'               => $client->lead_id,
            'name'                  => $client->name,
            'phone'                 => $client->phone,
            'email'                 => $client->email,
            'pan_number'            => $client->pan_number,
            'loan_type'             => $client->loan_type,
            'amount'                => $client->amount,
            'amount_display'        => $client->amount_formatted,   // '₹45L'
            'monthly_income'        => $client->monthly_income,
            'emi_amount'            => $client->emi_amount,
            'tenure_months'         => $client->tenure_months,
            'disbursed_at'          => $client->disbursed_at ? (string)$client->disbursed_at : null,
            'cibil_score'           => $client->cibil_score,
            'cibil_category'        => $client->cibil_category,     // 'excellent'|'good'|'poor'
            'stage'                 => $client->stage,
            'bank_reference_number' => $client->bank_reference_number,
            'notes'                 => $client->notes,
            'initials'              => $client->initials,           // 'RK'
            'managed_by'            => $client->managed_by,
            'manager'               => $client->manager ? [
                'id'       => $client->manager->id,
                'name'     => $client->manager->name,
                'emp_code' => $client->manager->emp_code,
            ] : null,
            'bank_policy_id'        => $client->bank_policy_id,
            'bank_policy'           => $client->bankPolicy ? [
                'id'         => $client->bankPolicy->id,
                'name'       => $client->bankPolicy->name,
                'logo_code'  => $client->bankPolicy->logo_code,
                'brand_color'=> $client->bankPolicy->brand_color,
            ] : null,
            'franchise_id'          => $client->franchise_id,
            'franchise'             => $client->franchise ? [
                'id'   => $client->franchise->id,
                'name' => $client->franchise->name,
                'code' => $client->franchise->code,
            ] : null,
            'is_formal'             => true,
            'created_at'            => (string)$client->created_at,
            'updated_at'            => (string)$client->updated_at,
        ];
    }
}
