<?php
// app/Console/Kernel.php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Announcement;
use App\Jobs\SendAnnouncementJob;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Process scheduled announcements every minute
        $schedule->call(function () {
            $announcements = Announcement::readyToSend()->get();
            
            foreach ($announcements as $announcement) {
                SendAnnouncementJob::dispatch($announcement);
            }
        })->everyMinute()->name('process_announcements')->withoutOverlapping();

        // Optional: Cleanup old announcements (keep last 6 months)
        $schedule->command('model:prune', [
            '--model' => [Announcement::class],
        ])->monthly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}