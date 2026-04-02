<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * GET /api/tasks
     */
    public function index(Request $request): JsonResponse
    {
        $tasks = Task::forUser($request->user())
            ->with(['assignedTo:id,name,emp_code', 'assignedBy:id,name'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->priority, fn ($q, $p) => $q->where('priority', $p))
            ->when($request->assigned_to, fn ($q, $a) => $q->where('assigned_to', $a))
            ->when($request->category, fn ($q, $c) => $q->where('category', $c))
            ->orderByRaw("CASE 
                WHEN priority = 'Urgent' THEN 1 
                WHEN priority = 'High' THEN 2 
                WHEN priority = 'Medium' THEN 3 
                WHEN priority = 'Low' THEN 4 
                ELSE 5 
            END")
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $tasks->map(fn ($t) => $this->formatTask($t)),
        ]);
    }

    /**
     * POST /api/tasks
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['success' => false, 'message' => 'Admin or Manager access required.'], 403);
        }

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'priority'    => ['nullable', 'in:Low,Medium,High,Urgent'],
            'due_date'    => ['nullable', 'date'],
            'category'    => ['nullable', 'string', 'max:100'],
        ]);

        $validated['assigned_by'] = $user->id;
        $validated['status'] = 'Pending';

        $task = Task::create($validated);
        $task->load(['assignedTo:id,name,emp_code', 'assignedBy:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Task created.',
            'data'    => $this->formatTask($task),
        ], 201);
    }

    /**
     * PATCH /api/tasks/{task}
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        // Staff can only update status on their own tasks
        if ($user->role === 'staff' && $task->assigned_to !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Permission denied.'], 403);
        }

        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'priority'    => ['nullable', 'in:Low,Medium,High,Urgent'],
            'status'      => ['nullable', 'in:Pending,In Progress,Completed,Cancelled'],
            'due_date'    => ['nullable', 'date'],
            'category'    => ['nullable', 'string', 'max:100'],
        ]);

        // Auto-set completed_at
        if (isset($validated['status']) && $validated['status'] === 'Completed' && !$task->completed_at) {
            $validated['completed_at'] = now();
        }
        if (isset($validated['status']) && $validated['status'] !== 'Completed') {
            $validated['completed_at'] = null;
        }

        $task->update($validated);
        $task->load(['assignedTo:id,name,emp_code', 'assignedBy:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Task updated.',
            'data'    => $this->formatTask($task),
        ]);
    }

    /**
     * DELETE /api/tasks/{task}
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $task->delete();

        return response()->json(['success' => true, 'message' => 'Task deleted.']);
    }

    /**
     * POST /api/tasks/import-csv
     */
    public function importCsv(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'manager'])) {
            return response()->json(['success' => false, 'message' => 'Admin or Manager access required.'], 403);
        }

        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $file = $request->file('csv_file');
        $imported = 0;

        try {
            DB::beginTransaction();

            $handle = fopen($file->getRealPath(), 'r');
            $headers = array_map('strtolower', array_map('trim', fgetcsv($handle)));

            $titleIdx   = array_search('title', $headers) !== false ? array_search('title', $headers) : 0;
            $descIdx    = array_search('description', $headers);
            $assignIdx  = array_search('assigned_to', $headers) !== false ? array_search('assigned_to', $headers) : (array_search('emp_code', $headers) !== false ? array_search('emp_code', $headers) : false);
            $prioIdx    = array_search('priority', $headers);
            $dueIdx     = array_search('due_date', $headers) !== false ? array_search('due_date', $headers) : (array_search('due date', $headers) !== false ? array_search('due date', $headers) : false);
            $catIdx     = array_search('category', $headers);

            while (($row = fgetcsv($handle)) !== false) {
                if (empty(array_filter($row))) continue;

                $title = trim($row[$titleIdx] ?? '');
                if (empty($title)) continue;

                // Resolve assignee by emp_code or user ID
                $assignedTo = null;
                if ($assignIdx !== false && !empty($row[$assignIdx])) {
                    $val = trim($row[$assignIdx]);
                    $found = User::where('emp_code', $val)->orWhere('id', $val)->first();
                    $assignedTo = $found?->id;
                }

                Task::create([
                    'title'       => $title,
                    'description' => $descIdx !== false ? trim($row[$descIdx] ?? '') : null,
                    'assigned_to' => $assignedTo,
                    'assigned_by' => $user->id,
                    'priority'    => $prioIdx !== false ? trim($row[$prioIdx] ?? 'Medium') : 'Medium',
                    'due_date'    => $dueIdx !== false && !empty($row[$dueIdx]) ? trim($row[$dueIdx]) : null,
                    'category'    => $catIdx !== false ? trim($row[$catIdx] ?? '') : null,
                    'status'      => 'Pending',
                ]);

                $imported++;
            }

            fclose($handle);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$imported} tasks.",
                'data'    => ['imported_count' => $imported],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to import CSV.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function formatTask(Task $t): array
    {
        return [
            'id'          => $t->id,
            'title'       => $t->title,
            'description' => $t->description,
            'assigned_to' => $t->assigned_to,
            'assigned_user' => $t->assignedTo ? [
                'id'       => $t->assignedTo->id,
                'name'     => $t->assignedTo->name,
                'emp_code' => $t->assignedTo->emp_code,
            ] : null,
            'assigned_by_user' => $t->assignedBy ? [
                'id'   => $t->assignedBy->id,
                'name' => $t->assignedBy->name,
            ] : null,
            'priority'     => $t->priority,
            'status'       => $t->status,
            'due_date'     => $t->due_date?->toDateString(),
            'completed_at' => $t->completed_at?->toDateTimeString(),
            'category'     => $t->category,
            'is_overdue'   => $t->is_overdue,
            'created_at'   => $t->created_at?->toDateTimeString(),
        ];
    }
}
