<?php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () { $this->comment(Inspiring::quote()); })->hourly();

// dispatch follow up reminders every minute
// the job itself filters leads with follow up times in the current minute window
Schedule::job(new \App\Jobs\DispatchFollowUpReminders)->everyMinute();

// Daily database backup at midnight
Schedule::exec('mysqldump -u ' . config('database.connections.mysql.username') . 
              ' -p' . config('database.connections.mysql.password') . 
              ' ' . config('database.connections.mysql.database') . 
              ' > storage/backups/db-backup-' . date('Y-m-d') . '.sql')
        ->dailyAt('00:00');
