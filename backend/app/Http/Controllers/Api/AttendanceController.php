<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * POST /api/attendance/check-in
     */
    public function checkIn(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if already checked in today
        $existing = Attendance::where('user_id', $user->id)
            ->whereDate('check_in_at', today())
            ->first();
            
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Already checked in today at ' . $existing->check_in_at->format('H:i')
            ], 422);
        }

        $validated = $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'check_in_at' => now(),
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'status' => 'present',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'check_in',
            'model_type' => 'Attendance',
            'model_id' => $attendance->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Checked in successfully.',
            'data' => $attendance
        ]);
    }

    /**
     * POST /api/attendance/check-out
     */
    public function checkOut(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('check_in_at', today())
            ->whereNull('check_out_at')
            ->first();

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active check-in found for today.'
            ], 422);
        }

        $attendance->update([
            'check_out_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'check_out',
            'model_type' => 'Attendance',
            'model_id' => $attendance->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Checked out successfully.',
            'data' => $attendance
        ]);
    }
}
