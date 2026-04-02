<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\CompanyPolicy;
use App\Models\PushDevice;
use App\Models\LeaveRequest;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HRController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | hrcontroller
    |--------------------------------------------------------------------------
    |
    | manages holidays, company policies, push device registration,
    | and the full-proof leave management system
    |
    */

    // ── holidays ──────────────────────────────────────────────────────────────

    /**
     * GET /api/holidays
     */
    public function holidays(Request $request): JsonResponse
    {
        $holidays = Holiday::orderBy('date')
            ->when($request->year, fn ($q, $y) => $q->whereYear('date', $y))
            ->get(['id', 'title', 'date', 'type', 'is_optional']);

        return response()->json([
            'success' => true,
            'data' => $holidays,
        ]);
    }

    /**
     * POST /api/holidays
     */
    public function storeHoliday(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'date'        => ['required', 'date'],
            'type'        => ['nullable', 'string', 'max:50'],
            'is_optional' => ['nullable', 'boolean'],
        ]);

        $holiday = Holiday::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Holiday added.',
            'data' => $holiday,
        ], 201);
    }

    /**
     * DELETE /api/holidays/{holiday}
     */
    public function destroyHoliday(Request $request, Holiday $holiday): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $holiday->delete();

        return response()->json([
            'success' => true,
            'message' => 'Holiday deleted.',
        ]);
    }

    // ── company policies ─────────────────────────────────────────────────────

    /**
     * GET /api/company-policies
     */
    public function policies(Request $request): JsonResponse
    {
        $policies = CompanyPolicy::where('is_active', true)
            ->orderBy('updated_at', 'desc')
            ->get(['id', 'title', 'category', 'content', 'version', 'is_active', 'updated_at']);

        return response()->json([
            'success' => true,
            'data' => $policies,
        ]);
    }

    /**
     * POST /api/company-policies
     */
    public function storePolicy(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title'     => ['required', 'string', 'max:255'],
            'category'  => ['nullable', 'string', 'max:100'],
            'content'   => ['required', 'string'],
            'version'   => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $policy = CompanyPolicy::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Policy created.',
            'data' => $policy,
        ], 201);
    }

    /**
     * PUT /api/admin/hr/policies/{policy}
     */
    public function updatePolicy(Request $request, CompanyPolicy $policy): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title'     => ['required', 'string', 'max:255'],
            'category'  => ['nullable', 'string', 'max:100'],
            'content'   => ['required', 'string'],
            'version'   => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $policy->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Policy updated.',
            'data' => $policy,
        ]);
    }

    /**
     * DELETE /api/admin/hr/policies/{policy}
     */
    public function destroyPolicy(Request $request, CompanyPolicy $policy): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $policy->delete();

        return response()->json([
            'success' => true,
            'message' => 'Policy deleted.',
        ]);
    }

    // ── leave management ─────────────────────────────────────────────────────

    /**
     * GET /api/leaves
     *
     * Lists leave requests scoped by role.
     * Admin: all. Manager: own + team. Staff: own.
     * ?status=Pending|Approved|Rejected
     */
    public function leaves(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = LeaveRequest::forUser($user)
            ->with(['user:id,name,emp_code,department,role', 'approver:id,name'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc');

        $leaves = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => $leaves->getCollection()->map(fn ($l) => [
                'id'             => $l->id,
                'user'           => $l->user ? [
                    'id'         => $l->user->id,
                    'name'       => $l->user->name,
                    'emp_code'   => $l->user->emp_code,
                    'department' => $l->user->department,
                ] : null,
                'start_date'     => Carbon::parse($l->start_date)->format('Y-m-d'),
                'end_date'       => Carbon::parse($l->end_date)->format('Y-m-d'),
                'days'           => $l->days,
                'reason'         => $l->reason,
                'status'         => $l->status,
                'rejection_note' => $l->rejection_note,
                'approved_by'    => $l->approver?->name,
                'actioned_at'    => $l->actioned_at ? Carbon::parse($l->actioned_at)->toDateTimeString() : null,
                'created_at'     => Carbon::parse($l->created_at)->toDateTimeString(),
            ]),
            'meta' => [
                'total'        => $leaves->total(),
                'current_page' => $leaves->currentPage(),
                'last_page'    => $leaves->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/leaves
     *
     * Apply for leave. Any authenticated user can apply.
     */
    public function applyLeave(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'       => ['required', 'string', 'in:Sick Leave,Casual Leave,Earned Leave,Maternity Leave,Paternity Leave,Unpaid Leave,Other'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['required', 'string', 'max:1000'],
        ]);

        $validated['user_id'] = $request->user()->id;

        $leave = LeaveRequest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Leave request submitted. You will be notified once it is reviewed.',
            'data'    => [
                'id'     => $leave->id,
                'status' => $leave->status,
                'days'   => $leave->days,
            ],
        ], 201);
    }

    /**
     * PATCH /api/leaves/{leave}
     *
     * Approve or Reject a leave request. Admin/Manager only.
     * Body: { "status": "Approved"|"Rejected", "rejection_note": "..." }
     */
    public function updateLeave(Request $request, LeaveRequest $leave): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['success' => false, 'message' => 'Permission denied.'], 403);
        }

        // Managers can only action their team's leaves
        if ($user->role === 'manager') {
            $teamIds = $user->teamMembers()->pluck('id')->toArray();
            if (!in_array($leave->user_id, $teamIds)) {
                return response()->json(['success' => false, 'message' => 'You can only manage your team\'s leave requests.'], 403);
            }
        }

        $validated = $request->validate([
            'status'         => ['required', 'in:Approved,Rejected'],
            'rejection_note' => ['nullable', 'string', 'max:500'],
        ]);

        $leave->update([
            'status'         => $validated['status'],
            'approved_by'    => $user->id,
            'rejection_note' => $validated['rejection_note'] ?? null,
            'actioned_at'    => now(),
        ]);

        // ── Auto-create announcement notification for the staff member ──
        $statusEmoji = $validated['status'] === 'Approved' ? '✅' : '❌';
        $note = $validated['rejection_note'] ? " Reason: {$validated['rejection_note']}" : '';

        try {
            $startDate = Carbon::parse($leave->start_date)->format('d M');
            $endDate = Carbon::parse($leave->end_date)->format('d M');
            Announcement::create([
                'title'        => "{$statusEmoji} Leave {$validated['status']}",
                'message'      => "{$leave->user->name}'s leave request ({$leave->type}) from {$startDate} to {$endDate} has been {$validated['status']} by {$user->name}.{$note}",
                'target'       => 'staff',
                'priority'     => 'normal',
                'published_at' => now(),
                'created_by'   => $user->id,
            ]);
        } catch (\Exception $e) {
            // Non-critical: notification failure shouldn't block the action
            \Log::warning('Failed to create leave announcement: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Leave request {$validated['status']}.",
            'data'    => [
                'id'     => $leave->id,
                'status' => $leave->status,
            ],
        ]);
    }

    /**
     * GET /api/leaves/on-leave-today
     *
     * Returns users who are on approved leave today.
     */
    public function onLeaveToday(): JsonResponse
    {
        $leaves = LeaveRequest::activeToday()
            ->with('user:id,name,emp_code,department')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $leaves->map(fn ($l) => [
                'id'         => $l->id,
                'user_name'  => $l->user?->name,
                'user_code'  => $l->user?->emp_code,
                'department' => $l->user?->department,
                'type'       => $l->type,
                'end_date'   => Carbon::parse($l->end_date)->format('d M Y'),
            ]),
        ]);
    }

    // ── push device registration ─────────────────────────────────────────────

    /**
     * POST /api/push-subscriptions
     */
    public function registerPushDevice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform'     => ['required', 'in:android,ios,web'],
            'token'        => ['nullable', 'string'],
            'subscription' => ['nullable', 'array'],
            'device_name'  => ['nullable', 'string', 'max:100'],
        ]);

        $tokenValue = $validated['token'] ?? json_encode($validated['subscription'] ?? []);

        $device = PushDevice::updateOrCreate(
            [
                'user_id'  => $request->user()->id,
                'platform' => $validated['platform'],
            ],
            [
                'token'       => $tokenValue,
                'device_name' => $validated['device_name'] ?? null,
                'is_active'   => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Push device registered.',
            'data' => [
                'id'       => $device->id,
                'platform' => $device->platform,
            ],
        ]);
    }

    /**
     * DELETE /api/push-subscriptions
     */
    public function unregisterPushDevice(Request $request): JsonResponse
    {
        $request->validate([
            'platform' => ['required', 'in:android,ios,web'],
        ]);

        PushDevice::where('user_id', $request->user()->id)
            ->where('platform', $request->platform)
            ->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Push device unregistered.',
        ]);
    }
}
