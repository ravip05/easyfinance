<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lead;
use App\Services\FcmService;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendFollowUpReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crm:followups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send push notifications for lead follow-ups scheduled for today';

    /**
     * Execute the console command.
     */
    public function handle(FcmService $fcm)
    {
        $today = Carbon::today()->toDateString();
        $now = now()->setTimezone('Asia/Kolkata'); // Use timezone if necessary, assuming default config is ok
        
        $this->info("Scanning for follow-ups due on {$today}...");

        $leads = Lead::whereDate('follow_up_date', $today)
            ->whereNotIn('stage', ['Closed', 'Disbursed'])
            ->whereNotNull('assigned_to')
            ->with('assignedUser')
            ->get();

        if ($leads->isEmpty()) {
            $this->info("No follow-ups scheduled for today.");
            return 0;
        }

        $sentCount = 0;

        foreach ($leads as $lead) {
            $user = $lead->assignedUser;
            if (!$user) continue;

            $title = "Follow-up Reminder: {$lead->name}";
            $timeInfo = $lead->follow_up_time ? ' at ' . date('h:i A', strtotime($lead->follow_up_time)) : '';
            $body = "You have a scheduled follow-up with {$lead->name} ({$lead->phone}) today{$timeInfo}.";
            
            $sent = $fcm->sendToUser($user->id, $title, $body, [
                'type' => 'lead_followup',
                'lead_id' => (string) $lead->id,
            ]);

            if ($sent > 0) {
                $sentCount++;
            }
        }

        $this->info("Notifications triggered for {$leads->count()} leads. Successfully sent to {$sentCount} devices.");
        Log::info("CRM Followups Command: processed {$leads->count()} leads, sent {$sentCount} notifications.");

        return 0;
    }
}

