<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class NewAnnouncementNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $announcement;

    /**
     * Create a new notification instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Always save to database, and push via fcm if token exists
        return ['database', 'fcm'];
    }

    /**
     * Get the array representation of the notification for FCM.
     */
    public function toFcm(object $notifiable)
    {
        // This is a placeholder for the actual FCM integration logic.
        // In a real app, this would use a library like Kreait\Laravel\Firebase
        // or a custom FCM channel.
        
        $token = $notifiable->pushDevices()->latest()->value('token');
        
        if (!$token) return null;

        return [
            'to' => $token,
            'notification' => [
                'title' => '📢 New Announcement: ' . $this->announcement->title,
                'body' => $this->announcement->content,
                'sound' => 'default',
            ],
            'data' => [
                'type' => 'announcement',
                'id' => (string) $this->announcement->id,
            ]
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'announcement_id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'content' => $this->announcement->content,
        ];
    }
}
