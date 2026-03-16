<?php

namespace App\Services;

use App\Models\PushDevice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// sends push notifications via firebase cloud messaging http v1 api
// requires FIREBASE_PROJECT_ID and FIREBASE_SERVER_KEY in env

class FcmService
{
    private string $projectId;
    private string $serverKey;

    public function __construct()
    {
        $this->projectId = config('services.firebase.project_id', '');
        $this->serverKey = config('services.firebase.server_key', '');
    }

    // send a push notification to a single device token
    public function sendToDevice(string $token, string $title, string $body, array $data = []): bool
    {
        if (empty($this->serverKey) || empty($token)) {
            Log::warning('fcm: missing server key or device token, skipping push');
            return false;
        }

        $payload = [
            'message' => [
                'token' => $token,
                'notification' => [
                    'title' => $title,
                    'body'  => $body,
                ],
                'data' => array_map('strval', $data),
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'channel_id' => 'follow_up_reminders',
                        'sound'      => 'default',
                    ],
                ],
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'sound'            => 'default',
                            'content-available' => 1,
                        ],
                    ],
                ],
            ],
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->serverKey,
                'Content-Type'  => 'application/json',
            ])->post(
                "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send",
                $payload
            );

            if ($response->failed()) {
                Log::error('fcm: push failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                    'token'  => substr($token, 0, 20) . '...',
                ]);

                // deactivate stale tokens on 404 or invalid argument
                if (in_array($response->status(), [404, 400])) {
                    PushDevice::where('token', $token)->update(['is_active' => false]);
                }

                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('fcm: exception during push', ['error' => $e->getMessage()]);
            return false;
        }
    }

    // send to all active devices registered for a user
    public function sendToUser(int $userId, string $title, string $body, array $data = []): int
    {
        $devices = PushDevice::where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        $sent = 0;
        foreach ($devices as $device) {
            if ($this->sendToDevice($device->token, $title, $body, $data)) {
                $sent++;
            }
        }

        return $sent;
    }
}
