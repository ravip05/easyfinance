<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\FcmService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

// dispatched by the scheduler to send follow up reminders
// runs every minute via schedule:run and checks for leads
// with follow up times in the current minute window

class DispatchFollowUpReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function handle(FcmService $fcm): void
    {
        // find leads with followup times in the current minute window
        $now = now();
        $windowStart = $now->copy()->startOfMinute();
        $windowEnd = $now->copy()->endOfMinute();

        $leads = Lead::whereBetween('follow_up_date', [$windowStart, $windowEnd])
            ->whereNotNull('assigned_to')
            ->with('assignedUser:id,name')
            ->get();

        if ($leads->isEmpty()) {
            return;
        }

        Log::info("follow-up-reminders: found {$leads->count()} leads to notify");

        foreach ($leads as $lead) {
            $userId = $lead->assigned_to;

            $sent = $fcm->sendToUser(
                $userId,
                'Follow-Up Reminder',
                "Time to follow up with {$lead->name} ({$lead->loan_type})",
                [
                    'type'    => 'follow_up_reminder',
                    'lead_id' => (string) $lead->id,
                    'action'  => 'open_lead',
                ]
            );

            Log::info("follow-up-reminders: sent {$sent} notifications for lead {$lead->id}");
        }
    }
}
