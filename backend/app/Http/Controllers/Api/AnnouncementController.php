<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
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
            'target'   => 'required|in:all,staff,manager,dsa',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'published_at' => now(),
            'created_by'   => $request->user()->id,
            'channel_app'  => true,
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
