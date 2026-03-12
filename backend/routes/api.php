<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\FranchiseController;
use App\Http\Controllers\Api\HRController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — EasyFinance CRM
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api automatically by Laravel.
| Authentication uses Laravel Sanctum (token-based, stateless).
|
| Route groups:
|   Public  → /api/auth/*          (no token required)
|   Private → everything else      (Bearer token required)
|
*/

// ── Public: Authentication ────────────────────────────────────────────────────
Route::prefix('auth')->name('auth.')->group(function () {

    // POST /api/auth/login  →  { email, password }  →  { token, user }
    Route::post('login', [AuthController::class, 'login'])->name('login');

    // POST /api/auth/logout  (token required to know which token to revoke)
    Route::post('logout', [AuthController::class, 'logout'])
         ->middleware('auth:sanctum')
         ->name('logout');
});

// ── Private: Requires valid Sanctum Bearer token ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // GET /api/auth/me  — current user profile + role
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');

    // ── Leads ─────────────────────────────────────────────────────────────────
    // NOTE: Named extra routes MUST come before apiResource() so Laravel
    //       doesn't interpret "stats" or "export" as a {lead} wildcard.

    // GET  /api/leads/stats/pipeline  — count-per-stage for kanban headers
    Route::get('leads/stats/pipeline', [LeadController::class, 'pipelineStats'])
         ->name('leads.pipeline-stats');

    // GET  /api/leads/export/csv  — streams a CSV download of scoped leads
    Route::get('leads/export/csv', [LeadController::class, 'exportCsv'])
         ->name('leads.export');

    // Standard CRUD: index, store, show, update, destroy
    Route::apiResource('leads', LeadController::class);

    // PATCH /api/leads/{lead}/stage  — Body: { stage }
    //   Dedicated endpoint for pipeline drag-drop & stage dropdown.
    //   Kept separate from update() so staff can change stage without
    //   having full edit rights on the lead record.
    Route::patch('leads/{lead}/stage',  [LeadController::class, 'updateStage'])
         ->name('leads.stage');

    // PATCH /api/leads/{lead}/assign  — Body: { assigned_to }
    //   Reassign to a different user. Admin and Manager only.
    Route::patch('leads/{lead}/assign', [LeadController::class, 'reassign'])
         ->name('leads.assign');

    // ── Clients ───────────────────────────────────────────────────────────────

    // POST /api/clients/from-lead/{lead}
    //   Convert a lead → client atomically. Must precede apiResource().
    Route::post('clients/from-lead/{lead}', [ClientController::class, 'convertFromLead'])
         ->name('clients.convert');

    Route::apiResource('clients', ClientController::class);

    // PATCH /api/clients/{client}/stage  — Body: { stage }
    Route::patch('clients/{client}/stage', [ClientController::class, 'updateStage'])
         ->name('clients.stage');

    // ── Employees (internal staff — role IN admin, manager, staff) ────────────

    Route::apiResource('employees', EmployeeController::class);

    // PATCH /api/employees/{employee}/status  — Body: { status }
    Route::patch('employees/{employee}/status', [EmployeeController::class, 'updateStatus'])
         ->name('employees.status');

    // GET /api/employees/{employee}/leads  — leads assigned to this employee
    Route::get('employees/{employee}/leads', [EmployeeController::class, 'leads'])
         ->name('employees.leads');

    // ── Franchises ────────────────────────────────────────────────────────────

    Route::apiResource('franchises', FranchiseController::class);

    // GET /api/franchises/{franchise}/leads
    Route::get('franchises/{franchise}/leads',   [FranchiseController::class, 'leads'])
         ->name('franchises.leads');

    // GET /api/franchises/{franchise}/payouts
    Route::get('franchises/{franchise}/payouts', [FranchiseController::class, 'payouts'])
         ->name('franchises.payouts');

    // ── HR Module: Holidays, Policies, Push ──────────────────────────────────

    Route::get('holidays', [HRController::class, 'holidays'])->name('holidays.index');
    Route::post('holidays', [HRController::class, 'storeHoliday'])->name('holidays.store');
    Route::delete('holidays/{holiday}', [HRController::class, 'destroyHoliday'])->name('holidays.destroy');

    Route::get('company-policies', [HRController::class, 'policies'])->name('policies.index');
    Route::post('company-policies', [HRController::class, 'storePolicy'])->name('policies.store');

    Route::post('push-subscriptions', [HRController::class, 'registerPushDevice'])->name('push.register');
    Route::delete('push-subscriptions', [HRController::class, 'unregisterPushDevice'])->name('push.unregister');

    // ── Reports (stub — returns aggregated stats) ─────────────────────────────

    Route::get('reports', function (\Illuminate\Http\Request $request) {
        // stub: returns placeholder stats, will be expanded with real analytics
        $totalLeads = \App\Models\Lead::forUser($request->user())->count();
        $converted = \App\Models\Lead::forUser($request->user())->where('stage', 'Disbursed')->count();
        $rate = $totalLeads > 0 ? round(($converted / $totalLeads) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_leads' => $totalLeads,
                'conversions' => $converted,
                'conversion_rate' => $rate,
                'revenue' => '₹' . number_format($converted * 15000),
                'active_employees' => \App\Models\User::where('status', 'Active')->whereIn('role', ['admin','manager','staff'])->count(),
                'pipeline' => [],
                'leaderboard' => [],
                'branches' => [],
            ],
        ]);
    })->name('reports.index');
});

// ── Catch-all: return JSON 404 instead of falling through to the web router ───
Route::fallback(fn () => response()->json([
    'success' => false,
    'message' => 'API endpoint not found.',
], 404));
