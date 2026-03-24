<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BulkAllocationController extends Controller
{
    /**
     * POST /api/hr/allocate-bulk
     *
     * Processes a CSV upload, creates leads, and allocates them to active staff
     * using a weighted round-robin based on the user's `seniority` tier.
     * Memory-safe for 500+ rows via native PHP file streams (fgetcsv).
     */
    public function allocateBulk(Request $request): JsonResponse
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'], // 5MB max
        ]);

        $file = $request->file('csv_file');

        $uploader = $request->user();

        // 1. Build the weighted allocation pool
        $query = User::active()->orderByDesc('seniority');

        // Multi-tenancy: if the uploader belongs to a franchise, restrict allocation 
        // to that franchise's users. Otherwise, allocate globally to internal staff.
        if ($uploader->franchise_id) {
            $query->where('franchise_id', $uploader->franchise_id);
        } else {
            $query->internal();
        }

        $eligibleUsers = $query->get(['id', 'seniority']);

        if ($eligibleUsers->isEmpty()) {
            throw ValidationException::withMessages([
                'csv_file' => 'No active internal staff available for allocation.',
            ]);
        }

        $allocationPool = [];
        foreach ($eligibleUsers as $user) {
            // Weight is derived from seniority (default to 1 if not set or <= 0)
            $weight = max(1, (int)$user->seniority);
            for ($i = 0; $i < $weight; $i++) {
                $allocationPool[] = $user->id;
            }
        }

        $poolSize = count($allocationPool);
        $poolIndex = 0;
        $processedCount = 0;
        $batchSize = 200; // Insert in chunks of 200
        $leadsToInsert = [];

        $now = now();
        $addedBy = $request->user()->id;

        // 2. Stream the CSV file using native PHP
        try {
            DB::beginTransaction();

            $handle = fopen($file->getRealPath(), 'r');
            if ($handle === false) {
                throw new \Exception('Failed to open uploaded file stream.');
            }

            // Read headers to map column indices dynamically
            $headerRow = fgetcsv($handle);
            if (!$headerRow) {
                throw new \Exception('CSV file is empty or unreadable.');
            }

            // Normalize headers to lowercase to make mapping easier
            $headers = array_map('strtolower', array_map('trim', $headerRow));
            $nameIdx   = array_search('name', $headers) !== false ? array_search('name', $headers) : 0;
            $phoneIdx  = array_search('phone', $headers) !== false ? array_search('phone', $headers) : 1;
            $typeIdx   = array_search('loan type', $headers) !== false ? array_search('loan type', $headers) : (array_search('loan_type', $headers) !== false ? array_search('loan_type', $headers) : 2);
            $amountIdx = array_search('amount', $headers) !== false ? array_search('amount', $headers) : (array_search('loan amount', $headers) !== false ? array_search('loan amount', $headers) : 3);
            $prioIdx   = array_search('priority', $headers) !== false ? array_search('priority', $headers) : 4;
            $emailIdx  = array_search('email', $headers);

            while (($row = fgetcsv($handle)) !== false) {
                // Skip empty lines
                if (empty(array_filter($row))) {
                    continue;
                }

                $name = trim($row[$nameIdx] ?? '');
                if (empty($name)) {
                    continue; // Skip rows without a name
                }

                // Assign via round-robin pool
                $assignedTo = $allocationPool[$poolIndex];
                $poolIndex = ($poolIndex + 1) % $poolSize;

                // Build lead array
                $leadsToInsert[] = [
                    'name'         => $name,
                    'phone'        => trim($row[$phoneIdx] ?? ''),
                    'email'        => $emailIdx !== false ? trim($row[$emailIdx] ?? null) : null,
                    'loan_type'    => trim($row[$typeIdx] ?? 'Personal'),
                    'loan_amount'  => (float)($row[$amountIdx] ?? 0),
                    'stage'        => 'New',
                    'priority'     => trim($row[$prioIdx] ?? 'Medium'),
                    'franchise_id' => $uploader->franchise_id, // Auto-tag if uploader is franchise
                    'assigned_to'  => $assignedTo,
                    'added_by'     => $addedBy,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ];

                $processedCount++;

                // Bulk insert in chunks to save memory
                if (count($leadsToInsert) >= $batchSize) {
                    Lead::insert($leadsToInsert);
                    $leadsToInsert = [];
                }
            }

            // Insert remaining items
            if (count($leadsToInsert) > 0) {
                Lead::insert($leadsToInsert);
            }

            fclose($handle);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully imported and allocated $processedCount leads.",
                'data' => [
                    'imported_count' => $processedCount,
                ],
            ]);

        } catch (\Exception $e) {
            if (isset($handle) && is_resource($handle)) {
                fclose($handle);
            }
            DB::rollBack();
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process CSV file. Ensure it has correct headers (Name, Phone, Loan Type, Amount, Priority).',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
