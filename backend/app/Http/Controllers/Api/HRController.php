<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\CompanyPolicy;
use App\Models\PushDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HRController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | hrcontroller
    |--------------------------------------------------------------------------
    |
    | manages holidays, company policies, and push device registration
    | all authenticated users can view holidays and policies
    | only admin can create/update/delete
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
        $policies = CompanyPolicy::orderBy('updated_at', 'desc')
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

    // ── push device registration ─────────────────────────────────────────────

    /**
     * POST /api/push-subscriptions
     *
     * registers a device token for push notifications
     * handles android, ios, and web platforms
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

        // upsert: update existing device or create new
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
     *
     * unregisters the current device on logout
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
