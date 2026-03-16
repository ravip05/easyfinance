<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | EmployeeController
    |--------------------------------------------------------------------------
    |
    | Manages internal staff (role IN admin, manager, staff).
    | DSA users are managed via FranchiseController, not here.
    |
    | Scoping:
    |   admin   → sees all internal employees
    |   manager → sees only their direct reports (team_leader_id = self)
    |   staff   → no access (403)
    |
    */

    /**
     * GET /api/employees
     *
     * Returns the role-scoped list of employees with lead/conversion stats.
     * Maps to the prototype's EMPLOYEES + ALL_STAFF arrays combined.
     *
     * Query params:
     *   ?search=priya
     *   ?role=manager|staff
     *   ?department=Home+Loans
     *   ?status=Active|On+Leave|Inactive
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['staff', 'dsa', 'client'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $query = User::internal()->with('teamLeader:id,name,emp_code');

        // Managers only see their direct reports
        if ($user->role === 'manager') {
            $query->where('team_leader_id', $user->id);
        }

        // ── Filters ───────────────────────────────────────────────────────────
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('emp_code', 'like', "%{$search}%");
            });
        }
        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }
        if ($dept = $request->input('department')) {
            $query->where('department', $dept);
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Attach lead counts as aggregates — avoids N+1
        $query->withCount([
            'assignedLeads as total_leads',
            'assignedLeads as converted_leads' => fn ($q) => $q->where('stage', 'Disbursed'),
        ]);

        $employees = $query->orderBy('name')->paginate(
            min((int) $request->input('per_page', 50), 100)
        );

        return response()->json([
            'success' => true,
            'data'    => $employees->getCollection()->map(fn ($e) => $this->formatEmployee($e)),
            'meta'    => [
                'current_page' => $employees->currentPage(),
                'last_page'    => $employees->lastPage(),
                'per_page'     => $employees->perPage(),
                'total'        => $employees->total(),
            ],
        ]);
    }

    /**
     * POST /api/employees
     *
     * Creates a new internal employee. Admin only.
     * Auto-generates emp_code (EF-001, EF-002 …).
     * Default password = phone number (must be changed on first login).
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'name'            => ['required', 'string', 'min:2', 'max:100'],
            'email'           => ['required', 'email', 'unique:users,email'],
            'phone'           => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'role'            => ['required', Rule::in(['admin', 'manager', 'staff'])],
            'department'      => ['nullable', 'string', 'max:100'],
            'team_leader_id'  => ['nullable', 'integer', 'exists:users,id'],
            'joining_date'    => ['nullable', 'date'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'password'        => ['nullable', 'string', 'min:6'],
        ]);

        // Auto-generate sequential emp_code
        $lastCode = User::where('emp_code', 'like', 'EF-%')
                        ->orderByRaw('CAST(SUBSTRING(emp_code, 4) AS INTEGER) DESC')
                        ->value('emp_code');
        $nextNum  = $lastCode ? ((int) substr($lastCode, 3)) + 1 : 1;
        $validated['emp_code'] = 'EF-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        // Default password = phone number
        $validated['password'] = Hash::make($validated['password'] ?? $validated['phone']);
        $validated['status']   = 'Active';

        $employee = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => "Employee \"{$employee->name}\" ({$employee->emp_code}) created. Default password is their phone number.",
            'data'    => $this->formatEmployee($employee),
        ], 201);
    }

    /**
     * GET /api/employees/{employee}
     */
    public function show(Request $request, User $employee): JsonResponse
    {
        $this->authorizeEmployeeAccess($request->user(), $employee);

        $employee->load(['teamLeader:id,name,emp_code', 'teamMembers:id,name,emp_code,role'])
                 ->loadCount([
                     'assignedLeads as total_leads',
                     'assignedLeads as converted_leads' => fn ($q) => $q->where('stage', 'Disbursed'),
                 ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatEmployee($employee, detailed: true),
        ]);
    }

    /**
     * PUT /api/employees/{employee}
     *
     * Updates an employee record. Admin only.
     */
    public function update(Request $request, User $employee): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'name'            => ['sometimes', 'string', 'min:2', 'max:100'],
            'email'           => ['sometimes', 'email', Rule::unique('users')->ignore($employee->id)],
            'phone'           => ['sometimes', 'string', 'regex:/^[0-9]{10}$/'],
            'role'            => ['sometimes', Rule::in(['admin', 'manager', 'staff'])],
            'department'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'team_leader_id'  => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'joining_date'    => ['sometimes', 'nullable', 'date'],
            'commission_rate' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1'],
            'password'        => ['sometimes', 'nullable', 'string', 'min:6'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $employee->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully.',
            'data'    => $this->formatEmployee($employee),
        ]);
    }

    /**
     * DELETE /api/employees/{employee}
     *
     * Soft-deactivates the employee (sets status = Inactive) instead of
     * hard-deleting, to preserve the lead/client history audit trail.
     * Admin only. Cannot deactivate yourself.
     */
    public function destroy(Request $request, User $employee): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        if ($request->user()->id === $employee->id) {
            return response()->json(['success' => false, 'message' => 'You cannot deactivate your own account.'], 422);
        }

        // Safety check — do not remove the last admin
        if ($employee->role === 'admin' && User::where('role', 'admin')->where('status', 'Active')->count() <= 1) {
            return response()->json(['success' => false, 'message' => 'Cannot deactivate the last active administrator.'], 422);
        }

        $employee->update(['status' => 'Inactive']);
        $employee->tokens()->delete(); // Force logout of any active sessions

        return response()->json([
            'success' => true,
            'message' => "{$employee->name} has been deactivated. Their lead history is preserved.",
        ]);
    }

    /**
     * PATCH /api/employees/{employee}/status
     *
     * Quick-toggle: Active / On Leave / Inactive
     * Request body: { "status": "On Leave" }
     */
    public function updateStatus(Request $request, User $employee): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $request->validate([
            'status' => ['required', Rule::in(['Active', 'On Leave', 'Inactive'])],
        ]);

        $employee->update(['status' => $request->status]);

        // If setting to Inactive, force-logout the user
        if ($request->status === 'Inactive') {
            $employee->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => "{$employee->name}'s status updated to \"{$request->status}\".",
            'data'    => ['id' => $employee->id, 'status' => $employee->status],
        ]);
    }

    /**
     * GET /api/employees/{employee}/leads
     *
     * Returns the 50 most recent leads assigned to this employee.
     * Used in the employee detail side panel.
     */
    public function leads(Request $request, User $employee): JsonResponse
    {
        $this->authorizeEmployeeAccess($request->user(), $employee);

        $leads = Lead::where('assigned_to', $employee->id)
                     ->with('addedByUser:id,name')
                     ->orderBy('created_at', 'desc')
                     ->limit(50)
                     ->get(['id', 'name', 'phone', 'loan_type', 'stage', 'priority', 'amount', 'created_at', 'added_by']);

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
                'created_at' => $l->created_at->toDateString(),
            ]),
        ]);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private function authorizeEmployeeAccess(User $requestingUser, User $targetEmployee): void
    {
        if ($requestingUser->role === 'staff') {
            abort(403, 'Insufficient permissions.');
        }
        if ($requestingUser->role === 'manager'
            && $targetEmployee->team_leader_id !== $requestingUser->id
            && $targetEmployee->id !== $requestingUser->id) {
            abort(403, 'You can only view your direct reports.');
        }
    }

    private function formatEmployee(User $employee, bool $detailed = false): array
    {
        $data = [
            'id'              => $employee->id,
            'emp_code'        => $employee->emp_code,
            'name'            => $employee->name,
            'email'           => $employee->email,
            'phone'           => $employee->phone,
            'role'            => $employee->role,
            'department'      => $employee->department,
            'status'          => $employee->status,
            'joining_date'    => $employee->joining_date?->toDateString(),
            'commission_rate' => $employee->commission_rate,
            'commission_display' => $employee->commission_rate_display, // '0.25%'
            'initials'        => $employee->initials,
            'team_leader_id'  => $employee->team_leader_id,
            'team_leader'     => $employee->teamLeader ? [
                'id'       => $employee->teamLeader->id,
                'name'     => $employee->teamLeader->name,
                'emp_code' => $employee->teamLeader->emp_code,
            ] : null,
            // Aggregates (populated by withCount in index())
            'total_leads'     => $employee->total_leads ?? null,
            'converted_leads' => $employee->converted_leads ?? null,
        ];

        if ($detailed) {
            $data['team_members'] = $employee->teamMembers?->map(fn ($m) => [
                'id'       => $m->id,
                'name'     => $m->name,
                'emp_code' => $m->emp_code,
                'role'     => $m->role,
            ])->toArray() ?? [];
        }

        return $data;
    }
}
