<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Commission;
use App\Models\Payout;
use Illuminate\Support\Facades\Auth;

class StaffController extends Controller
{
    /**
     * Get details for the logged-in staff member
     */
    public function me()
    {
        $user = Auth::user();
        
        // Sum up commission stats
        $stats = [
            'total_earned' => Commission::where('user_id', $user->id)
                ->where('status', 'paid')
                ->sum('amount'),
            'total_paid' => Payout::where('user_id', $user->id)
                ->where('status', 'paid')
                ->sum('net_amount'),
            'pending_amount' => Commission::where('user_id', $user->id)
                ->where('status', 'pending')
                    ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'stats' => $stats
            ]
        ]);
    }

    /**
     * Get payout history for the logged-in staff
     */
    public function payouts()
    {
        $user = Auth::user();
        $payouts = Payout::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $payouts
        ]);
    }
}
