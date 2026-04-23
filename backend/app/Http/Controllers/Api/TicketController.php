<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketReply;
use App\Models\TicketStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    // list tickets scoped by rbac
    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::forUser($request->user())
            ->with(['user:id,name,role', 'assignedUser:id,name'])
            ->withCount('replies')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $tickets,
        ]);
    }

    // create a new ticket
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject'     => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'category'    => 'required|string',
        ]);

        $ticket = Ticket::create([
            'user_id'     => $request->user()->id,
            'subject'     => $validated['subject'],
            'description' => $validated['description'],
            'priority'    => $validated['priority'],
            'category'    => $validated['category'],
            'status'      => 'Open',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $ticket->load('user:id,name,role'),
        ], 201);
    }

    // show a single ticket with threaded replies and status audit log
    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorizeTicketAccess($request->user(), $ticket);

        $ticket->load([
            'user:id,name,role',
            'assignedUser:id,name',
            'threadedReplies',
            'statusLogs.changedByUser:id,name',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $ticket,
        ]);
    }

    // update ticket metadata with state machine validation
    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        // only admin and manager can modify ticket properties
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins and managers can update tickets.',
            ], 403);
        }

        $validated = $request->validate([
            'status'      => ['sometimes', Rule::in(Ticket::STATUSES)],
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'priority'    => ['sometimes', Rule::in(['Low', 'Medium', 'High'])],
        ]);

        // if status is changing validate the transition is allowed
        if (isset($validated['status']) && $validated['status'] !== $ticket->status) {
            if (!$ticket->canTransitionTo($validated['status'])) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot transition from '{$ticket->status}' to '{$validated['status']}'.",
                    'allowed' => Ticket::TRANSITIONS[$ticket->status] ?? [],
                ], 422);
            }

            $this->logStatusTransition(
                $ticket,
                $user->id,
                $ticket->status,
                $validated['status'],
                'manual',
                $request->input('reason')
            );
        }

        $ticket->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $ticket->load(['user:id,name', 'assignedUser:id,name']),
        ]);
    }

    // add a reply to a ticket with optional parent threading
    public function reply(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorizeTicketAccess($request->user(), $ticket);

        $validated = $request->validate([
            'message'          => 'required|string',
            'parent_id'        => 'sometimes|nullable|exists:ticket_replies,id',
            'is_internal_note' => 'sometimes|boolean',
            'attachments'      => 'sometimes|array',
        ]);

        // if parent id is given verify it belongs to this ticket
        if (!empty($validated['parent_id'])) {
            $parentReply = TicketReply::where('id', $validated['parent_id'])
                ->where('ticket_id', $ticket->id)
                ->first();

            if (!$parentReply) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parent reply does not belong to this ticket.',
                ], 422);
            }
        }

        // internal notes restricted to admin and manager
        if (!empty($validated['is_internal_note']) && !in_array($request->user()->role, ['admin', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins and managers can create internal notes.',
            ], 403);
        }

        $reply = TicketReply::create([
            'ticket_id'        => $ticket->id,
            'user_id'          => $request->user()->id,
            'parent_id'        => $validated['parent_id'] ?? null,
            'message'          => $validated['message'],
            'is_internal_note' => $validated['is_internal_note'] ?? false,
            'attachments'      => $validated['attachments'] ?? null,
        ]);

        // automatic status transitions based on who is replying
        $this->applyAutoTransition($ticket, $request->user());

        return response()->json([
            'success' => true,
            'data'    => $reply->load('user:id,name,role'),
        ], 201);
    }

    // high level stats for the support center dashboard
    public function portal(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'total_open'     => Ticket::forUser($user)->where('status', 'Open')->count(),
            'in_progress'    => Ticket::forUser($user)->where('status', 'In Progress')->count(),
            'awaiting_reply' => Ticket::forUser($user)->where('status', 'Awaiting Reply')->count(),
            'resolved_today' => Ticket::forUser($user)
                ->where('status', 'Resolved')
                ->whereDate('updated_at', now()->toDateString())
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    // status transition triggers based on reply context
    private function applyAutoTransition(Ticket $ticket, $user): void
    {
        $previousStatus = $ticket->status;
        $newStatus = null;

        // admin or manager reply to an open ticket moves it to in progress
        if ($ticket->status === 'Open' && in_array($user->role, ['admin', 'manager'])) {
            $newStatus = 'In Progress';
        }

        // admin or manager reply to an awaiting reply ticket moves it to in progress
        if ($ticket->status === 'Awaiting Reply' && in_array($user->role, ['admin', 'manager'])) {
            $newStatus = 'In Progress';
        }

        // staff or client reply to an in progress ticket moves it to awaiting reply
        if ($ticket->status === 'In Progress' && in_array($user->role, ['staff', 'dsa', 'client'])) {
            $newStatus = 'Awaiting Reply';
        }

        if ($newStatus && $ticket->canTransitionTo($newStatus)) {
            $this->logStatusTransition($ticket, $user->id, $previousStatus, $newStatus, 'auto_reply');
            $ticket->update(['status' => $newStatus]);
        }
    }

    // write an immutable audit record of the status change
    private function logStatusTransition(
        Ticket $ticket,
        int $changedBy,
        string $from,
        string $to,
        string $trigger = 'manual',
        ?string $reason = null
    ): void {
        TicketStatusLog::create([
            'ticket_id'  => $ticket->id,
            'changed_by' => $changedBy,
            'from_status' => $from,
            'to_status'   => $to,
            'trigger'     => $trigger,
            'reason'      => $reason,
        ]);
    }

    // rbac gate for individual ticket access
    private function authorizeTicketAccess($user, Ticket $ticket): void
    {
        if ($user->role === 'admin') return;

        $allowed = Ticket::forUser($user)->where('id', $ticket->id)->exists();
        if (!$allowed) abort(403, 'You do not have permission to access this ticket.');
    }
}
