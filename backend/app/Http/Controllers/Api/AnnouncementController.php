<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $announcements = Announcement::published()
            ->forRole($user->role)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $announcements->getCollection(),
            'meta'    => [
                'current_page' => $announcements->currentPage(),
                'last_page'    => $announcements->lastPage(),
                'per_page'     => $announcements->perPage(),
                'total'        => $announcements->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'manager'])) {
            abort(403);
        }

        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'message'  => 'required|string',
            'target'   => 'required|in:all,staff,manager,dsa,franchise_all',
            'priority' => 'required|in:normal,important,urgent',
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'published_at' => now(),
            'created_by'   => $request->user()->id,
            'channel_app'  => true,
        ]);

        // --- Notification Dispatch ---
        // Notify all users in the target group
        $targetUsers = User::active();
        if ($validated['target'] !== 'all') {
            $targetUsers->where('role', $validated['target']);
        }
        
        try {
            \Illuminate\Support\Facades\Notification::send(
                $targetUsers->get(), 
                new \App\Notifications\NewAnnouncementNotification($announcement)
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('announcement_notification_failed: ' . $e->getMessage());
        }

        // Send Push Notification
        try {
            app(\App\Services\FcmService::class)->sendToAllActiveUsers(
                '📢 ' . $announcement->title,
                strip_tags($announcement->message),
                ['type' => 'announcement', 'id' => (string)$announcement->id, 'url' => '/announcements']
            );
        } catch (\Exception $e) { // passive failure if firebase keys are missing }
        }

        // --- Audit Log ---
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'created_announcement',
            'model_type' => 'Announcement',
            'model_id' => $announcement->id,
            'new_values' => $announcement->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $announcement,
        ], 201);
    }

    public function markRead(Request $request, Announcement $announcement): JsonResponse
    {
        $announcement->markReadBy($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Announcement marked as read.',
        ]);
    }
}
