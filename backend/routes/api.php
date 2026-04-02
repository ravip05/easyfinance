<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\FranchiseController;
use App\Http\Controllers\Api\HRController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LmsController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\BankPolicyController;
use App\Http\Controllers\Api\BulkAllocationController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ReportController;
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

    // ── Attendance ───────────────────────────────────────────────────────────
    Route::post('attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.checkin');
    Route::post('attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.checkout');

    // GET /api/auth/me  — current user profile + role
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');

    // ── Settings ─────────────────────────────────────────────────────────────
    Route::get('settings/public', [App\Http\Controllers\Api\SettingsController::class, 'publicSettings']);
    Route::get('user/settings', [AuthController::class, 'me']); // Alias for frontend
    Route::post('settings/profile', [AuthController::class, 'updateProfile']);
    Route::post('auth/impersonate', [AuthController::class, 'impersonate'])->middleware('role:admin');

    // Admin Settings (System-wide)
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('settings', [App\Http\Controllers\Api\SettingsController::class, 'index']);
        Route::post('settings', [App\Http\Controllers\Api\SettingsController::class, 'update']);
        Route::get('users', [App\Http\Controllers\Api\SettingsController::class, 'users']);
        Route::post('users', [App\Http\Controllers\Api\SettingsController::class, 'createUser']);
        Route::patch('users/{id}', [App\Http\Controllers\Api\SettingsController::class, 'updateUser']);
        Route::delete('users/{id}', [App\Http\Controllers\Api\SettingsController::class, 'deleteUser']);
        Route::post('users/{id}/restore', [App\Http\Controllers\Api\SettingsController::class, 'restoreUser']);
        Route::patch('users/{id}/status', [App\Http\Controllers\Api\SettingsController::class, 'blockUser']);
        Route::get('departments', [App\Http\Controllers\Api\SettingsController::class, 'departments']);
        Route::post('departments', [App\Http\Controllers\Api\SettingsController::class, 'addDepartment']);
        Route::delete('departments/{id}', [App\Http\Controllers\Api\SettingsController::class, 'deleteDepartment']);
        Route::patch('departments/{id}', [App\Http\Controllers\Api\SettingsController::class, 'updateDepartment']);
        // Team Allocation Rules
        Route::get('allocation-rules', [App\Http\Controllers\Api\SettingsController::class, 'allocationRules']);
        Route::post('allocation-rules', [App\Http\Controllers\Api\SettingsController::class, 'storeAllocationRule']);
        Route::patch('allocation-rules/{id}', [App\Http\Controllers\Api\SettingsController::class, 'updateAllocationRule']);
        Route::delete('allocation-rules/{id}', [App\Http\Controllers\Api\SettingsController::class, 'deleteAllocationRule']);
        Route::get('pipeline-stages', [App\Http\Controllers\Api\SettingsController::class, 'pipelineStages']);
        Route::post('pipeline-stages', [App\Http\Controllers\Api\SettingsController::class, 'updatePipelineStages']);
        Route::get('audit-logs', [App\Http\Controllers\Api\SettingsController::class, 'auditLog']);
        Route::get('commission-slabs', [App\Http\Controllers\Api\SettingsController::class, 'commissionSlabs']);
        Route::post('commission-slabs', [App\Http\Controllers\Api\SettingsController::class, 'updateCommissionSlabs']);
        Route::delete('commission-slabs/{id}', [App\Http\Controllers\Api\SettingsController::class, 'deleteCommissionSlab']);
    });

    // ── Leads ─────────────────────────────────────────────────────────────────
    // NOTE: Named extra routes MUST come before apiResource() so Laravel
    //       doesn't interpret "stats" or "export" as a {lead} wildcard.

    // GET  /api/leads/stats/pipeline  — count-per-stage for kanban headers
    Route::get('leads/stats/pipeline', [LeadController::class, 'pipelineStats'])
         ->name('leads.pipeline-stats');

    // GET  /api/leads/export/csv  — streams a CSV download of scoped leads
    Route::get('leads/export/csv', [LeadController::class, 'exportCsv'])
         ->name('leads.export');

    // GET  /api/leads/duplicates  — phone/pan collision groups
    Route::get('leads/duplicates', [LeadController::class, 'getDuplicates'])
         ->name('leads.duplicates');

    // POST /api/leads/merge — merge duplicate leads
    Route::post('leads/merge', [LeadController::class, 'merge'])
         ->name('leads.merge');

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

    // POST /api/hr/employees/{employee}/seniority — update seniority tier + audit log
    Route::post('hr/employees/{employee}/seniority', [EmployeeController::class, 'updateSeniority'])
         ->middleware('role:admin')
         ->name('employees.seniority');

    // ── Franchises ────────────────────────────────────────────────────────────

    Route::apiResource('franchises', FranchiseController::class);

    // GET /api/franchises/{franchise}/leads
    Route::get('franchises/{franchise}/leads',   [FranchiseController::class, 'leads'])
         ->name('franchises.leads');

    // GET /api/franchises/{franchise}/payouts
    Route::get('franchises/{franchise}/payouts', [FranchiseController::class, 'payouts'])
         ->name('franchises.payouts');

    // ── HR Module: Holidays, Policies, Push ──────────────────────────────────

    Route::post('hr/allocate-bulk', [BulkAllocationController::class, 'allocateBulk'])
        ->middleware('role:admin,manager')
        ->name('hr.allocate-bulk');

    Route::get('holidays', [HRController::class, 'holidays'])->name('holidays.index');
    Route::post('holidays', [HRController::class, 'storeHoliday'])->name('holidays.store');
    Route::delete('holidays/{holiday}', [HRController::class, 'destroyHoliday'])->name('holidays.destroy');

    Route::get('company-policies', [HRController::class, 'policies'])->name('policies.index');
    Route::post('company-policies', [HRController::class, 'storePolicy'])->name('policies.store');
    
    Route::middleware('role:admin')->group(function () {
        Route::put('admin/hr/policies/{policy}', [HRController::class, 'updatePolicy'])->name('admin.policies.update');
        Route::delete('admin/hr/policies/{policy}', [HRController::class, 'destroyPolicy'])->name('admin.policies.destroy');
    });

    Route::post('push-subscriptions', [HRController::class, 'registerPushDevice'])->name('push.register');
    Route::delete('push-subscriptions', [HRController::class, 'unregisterPushDevice'])->name('push.unregister');

    // ── Leave Management ─────────────────────────────────────────────────────
    Route::get('leaves', [HRController::class, 'leaves'])->name('leaves.index');
    Route::post('leaves', [HRController::class, 'applyLeave'])->name('leaves.store');
    Route::patch('leaves/{leave}', [HRController::class, 'updateLeave'])->name('leaves.update');
    Route::get('leaves/on-leave-today', [HRController::class, 'onLeaveToday'])->name('leaves.today');

    // ── Attendance (listing) ─────────────────────────────────────────────────
    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('attendance/summary', [AttendanceController::class, 'summary'])->name('attendance.summary');

    // ── Payroll (admin, manager only) ────────────────────────────────────────
    Route::middleware('role:admin,manager')->group(function () {
        Route::get('payroll/summary',  [PayrollController::class, 'summary'])->name('payroll.summary');
        Route::post('payroll/process', [PayrollController::class, 'process'])->name('payroll.process');
    });

    // ── Staff Module (staff, manager, admin only) ─────────────────────────────
    Route::middleware('role:staff,manager,admin')->group(function () {
        Route::get('staff/me', [StaffController::class, 'me']);
        Route::get('staff/payouts', [StaffController::class, 'payouts']);
        Route::get('staff/commissions', [App\Http\Controllers\Api\CommissionController::class, 'myCommission']);
    });

    Route::middleware('role:admin,manager')->group(function () {
        Route::get('admin/staff-performance', [App\Http\Controllers\Api\CommissionController::class, 'staffPerformance']);
    });

    // ── Franchise Dashboard (dsa role only) ──────────────────────────────────
    Route::get('franchise/dashboard', [FranchiseController::class, 'dashboard'])
         ->middleware('role:dsa');

    // ── Client Dashboard (client role only) ──────────────────────────────────
    Route::get('client/dashboard', [ClientController::class, 'dashboard'])
         ->middleware('role:client');

    // ── Support Tickets ───────────────────────────────────────────────────────
    Route::get('tickets/portal', [TicketController::class, 'portal']);
    Route::apiResource('tickets', TicketController::class);
    Route::post('tickets/{ticket}/reply', [TicketController::class, 'reply'])->name('tickets.reply');

    // ── Announcements ─────────────────────────────────────────────────────────
    Route::get('announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::post('announcements/{announcement}/read', [AnnouncementController::class, 'markRead'])->name('announcements.read');

    // ── Bank Policies ─────────────────────────────────────────────────────────
    Route::apiResource('bank-policies', BankPolicyController::class);

    // ── LMS: Learning Management System ─────────────────────────────────────
    Route::group(['prefix' => 'lms'], function () {
        Route::get('courses', [LmsController::class, 'courses']);
        Route::get('courses/{id}', [LmsController::class, 'courseDetail']);
        Route::post('courses', [LmsController::class, 'storeCourse'])->middleware('role:admin');
        Route::patch('courses/{id}', [LmsController::class, 'updateCourse'])->middleware('role:admin');
        Route::delete('courses/{id}', [LmsController::class, 'deleteCourse'])->middleware('role:admin');
        Route::post('courses/{id}/enroll', [LmsController::class, 'enroll']);
        Route::post('courses/{id}/progress', [LmsController::class, 'updateProgress']);
        Route::post('courses/{courseId}/lessons', [LmsController::class, 'storeLesson'])->middleware('role:admin');
        Route::delete('courses/{courseId}/lessons/{lessonId}', [LmsController::class, 'deleteLesson'])->middleware('role:admin');
        
        Route::get('materials', [LmsController::class, 'materials']);
        Route::post('materials', [LmsController::class, 'uploadMaterial'])->middleware('role:admin');
        Route::patch('materials/{id}', [LmsController::class, 'updateMaterial'])->middleware('role:admin');
        Route::delete('materials/{id}', [LmsController::class, 'deleteMaterial'])->middleware('role:admin');
        
        Route::get('quizzes', [LmsController::class, 'quizzes']);
        Route::post('quizzes', [LmsController::class, 'storeQuiz'])->middleware('role:admin');
        Route::post('quizzes/{id}/submit', [LmsController::class, 'submitQuiz']);
        
        Route::get('leaderboard', [LmsController::class, 'leaderboard']);
        Route::get('certificates', [LmsController::class, 'certificates']);
    });

    // ── Tasks ─────────────────────────────────────────────────────────────────
    Route::apiResource('tasks', TaskController::class);
    Route::post('tasks/import-csv', [TaskController::class, 'importCsv'])
         ->middleware('role:admin,manager')
         ->name('tasks.import');

    // ── Reports (real data) ──────────────────────────────────────────────────
    Route::prefix('reports')->group(function () {
        Route::get('summary', [ReportController::class, 'summary']);
        Route::get('leads', [ReportController::class, 'leads']);
        Route::get('revenue-trends', [ReportController::class, 'revenueTrends']);
        Route::get('branch-performance', [ReportController::class, 'branchPerformance']);
    });
});

// ── Catch-all: return JSON 404 instead of falling through to the web router ───
Route::fallback(fn () => response()->json([
    'success' => false,
    'message' => 'API endpoint not found.',
], 404));
