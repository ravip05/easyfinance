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

        // Geofencing Check
        $officeLat = \App\Models\Setting::get('office_lat');
        $officeLng = \App\Models\Setting::get('office_lng');
        $radius = \App\Models\Setting::get('office_radius', 500); // meters

        if ($officeLat && $officeLng && isset($validated['latitude']) && isset($validated['longitude'])) {
            $distance = $this->calculateDistance($validated['latitude'], $validated['longitude'], $officeLat, $officeLng);
            if ($distance > $radius) {
                return response()->json([
                    'success' => false,
                    'message' => "Check-in denied. You are " . round($distance) . "m away from the office. (Allowed: {$radius}m)"
                ], 403);
            }
        }

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

    /**
     * GET /api/attendance
     * List attendance for current user or all (if admin)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::where('user_id', $request->user()->id);
        
        if ($request->has('month')) {
            $query->whereMonth('check_in_at', $request->month);
        }
        if ($request->has('year')) {
            $query->whereYear('check_in_at', $request->year);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest('check_in_at')->get()
        ]);
    }

    /**
     * GET /api/attendance/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);

        $stats = Attendance::where('user_id', $user->id)
            ->whereMonth('check_in_at', $month)
            ->whereYear('check_in_at', $year)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'present' => $stats['present'] ?? 0,
                'late' => $stats['late'] ?? 0,
                'on-leave' => $stats['on-leave'] ?? 0,
                'absent' => 0, // Placeholder
            ]
        ]);
    }

    /**
     * Haversine formula to calculate distance between two points in meters
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
