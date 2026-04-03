<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamChannel;
use App\Models\TeamMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamChatController extends Controller
{
    // ── Channel Management ─────────────────────────────────────────────────

    /**
     * GET /api/team-chat/channels
     */
    public function channels(Request $request): JsonResponse
    {
        $channels = TeamChannel::withCount('messages')
            ->orderByDesc('is_default')
            ->orderBy('label')
            ->get()
            ->map(function ($ch) {
                return [
                    'id'            => $ch->id,
                    'name'          => $ch->name,
                    'label'         => $ch->label,
                    'icon'          => $ch->icon,
                    'description'   => $ch->description,
                    'is_default'    => $ch->is_default,
                    'messages_count'=> $ch->messages_count,
                    'last_message'  => $ch->messages()->latest()->first()?->only(['message', 'created_at']),
                ];
            });

        return response()->json($channels);
    }

    /**
     * POST /api/team-chat/channels (Admin only)
     */
    public function createChannel(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label'       => ['required', 'string', 'max:100'],
            'icon'        => ['nullable', 'string', 'max:10'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $channel = TeamChannel::create([
            'name'        => \Str::slug($validated['label']),
            'label'       => $validated['label'],
            'icon'        => $validated['icon'] ?? '💬',
            'description' => $validated['description'] ?? null,
            'is_default'  => false,
            'created_by'  => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Channel created.',
            'data'    => $channel,
        ], 201);
    }

    /**
     * PATCH /api/team-chat/channels/{channel} (Admin only)
     */
    public function updateChannel(Request $request, TeamChannel $channel): JsonResponse
    {
        $validated = $request->validate([
            'label'       => ['sometimes', 'string', 'max:100'],
            'icon'        => ['sometimes', 'string', 'max:10'],
            'description' => ['sometimes', 'string', 'max:255'],
        ]);

        $channel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Channel updated.',
            'data'    => $channel->fresh(),
        ]);
    }

    /**
     * DELETE /api/team-chat/channels/{channel} (Admin only)
     */
    public function deleteChannel(Request $request, TeamChannel $channel): JsonResponse
    {
        if ($channel->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a default channel.',
            ], 403);
        }

        $channel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Channel deleted.',
        ]);
    }

    // ── Messages ───────────────────────────────────────────────────────────

    /**
     * GET /api/team-chat/{channel}/messages
     */
    public function messages(Request $request, TeamChannel $channel): JsonResponse
    {
        $afterId = $request->input('after');
        
        $query = $channel->messages()
            ->with(['user:id,name,role,emp_code', 'replyTo:id,message,user_id', 'replyTo.user:id,name']);

        if ($afterId) {
            $query->where('id', '>', $afterId);
        }

        $messages = $query->orderBy('created_at', 'asc')
            ->latest('id')
            ->limit(100)
            ->get()
            ->sortBy('id')
            ->values()
            ->map(function ($msg) {
                return [
                    'id'         => $msg->id,
                    'message'    => $msg->message,
                    'user'       => [
                        'id'       => $msg->user->id,
                        'name'     => $msg->user->name,
                        'role'     => $msg->user->role,
                        'emp_code' => $msg->user->emp_code,
                        'initials' => strtoupper(substr($msg->user->name, 0, 1) . (str_contains($msg->user->name, ' ') ? substr(strrchr($msg->user->name, ' '), 1, 1) : '')),
                    ],
                    'reply_to'   => $msg->replyTo ? [
                        'id'      => $msg->replyTo->id,
                        'message' => \Str::limit($msg->replyTo->message, 80),
                        'user'    => $msg->replyTo->user?->name ?? 'Unknown',
                    ] : null,
                    'created_at' => $msg->created_at->toIso8601String(),
                    'time_ago'   => $msg->created_at->diffForHumans(),
                ];
            });

        return response()->json($messages);
    }

    /**
     * POST /api/team-chat/{channel}/messages
     */
    public function sendMessage(Request $request, TeamChannel $channel): JsonResponse
    {
        $validated = $request->validate([
            'message'     => ['required', 'string', 'max:2000'],
            'reply_to_id' => ['nullable', 'exists:team_messages,id'],
        ]);

        $msg = TeamMessage::create([
            'channel_id'  => $channel->id,
            'user_id'     => $request->user()->id,
            'message'     => $validated['message'],
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        $msg->load(['user:id,name,role,emp_code', 'replyTo:id,message,user_id', 'replyTo.user:id,name']);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'         => $msg->id,
                'message'    => $msg->message,
                'user'       => [
                    'id'       => $msg->user->id,
                    'name'     => $msg->user->name,
                    'role'     => $msg->user->role,
                    'emp_code' => $msg->user->emp_code,
                    'initials' => strtoupper(substr($msg->user->name, 0, 1) . (str_contains($msg->user->name, ' ') ? substr(strrchr($msg->user->name, ' '), 1, 1) : '')),
                ],
                'reply_to'   => $msg->replyTo ? [
                    'id'      => $msg->replyTo->id,
                    'message' => \Str::limit($msg->replyTo->message, 80),
                    'user'    => $msg->replyTo->user?->name ?? 'Unknown',
                ] : null,
                'created_at' => $msg->created_at->toIso8601String(),
                'time_ago'   => $msg->created_at->diffForHumans(),
            ],
        ], 201);
    }
}
