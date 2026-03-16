<?php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () { $this->comment(Inspiring::quote()); })->hourly();

// dispatch follow up reminders every minute
// the job itself filters leads with follow up times in the current minute window
Schedule::job(new \App\Jobs\DispatchFollowUpReminders)->everyMinute();
