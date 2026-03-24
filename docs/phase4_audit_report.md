# Phase 4 Audit Report: Missing & Partially Broken Features

This report identifies gaps in Phase 4 implementation based on `phase4_implementation_plan.md`, `TDD_V2_Universal.md`, and `PRD_V2_Universal.md`. 

> [!NOTE]
> `crm updates.docx` was not found in the filesystem but was cross-referenced as being integrated into the TDD/PRD v3.0 core.

## [hr/payroll]
- **Seniority Tracking (0%)**: Backend table `seniority_tracking` and logic for tracking years of experience are missing.
  - *Sidebar Instruction*: Create `seniority_tracking` migration and `POST /api/hr/employees/{id}/seniority` endpoint in `EmployeeController` using an audit-log pattern.
- **Payroll Summary & Process (0%)**: Endpoints `/api/payroll/summary` and `/api/payroll/process` are non-existent.
  - *Sidebar Instruction*: Implement `PayrollController` with an atomic `process` transaction to mark leads as 'Paid' and generate financial ledger entries.
- **Payroll History UI (0%)**: `PayrollHistoryList.jsx` component is missing from the frontend.
  - *Sidebar Instruction*: Create a searchable `PayrollHistoryList.jsx` component in `frontend/src/components` that consumes the new payroll ledger API.
- **Employee Status Refinement (Broken)**: `EmployeeController` lacks the seniority indicators and inline status toggles mentioned in the plan.
  - *Sidebar Instruction*: Update `EmployeeController.php` and `Employees.jsx` to support seniority-based performance indexing and bulk status toggles.

## [analytics]
- **Advanced Visualization (0%)**: `AnalyticsFunnelChart`, `RevenueGrowthChart`, and `BranchPerformanceBar` are missing.
  - *Sidebar Instruction*: Build Recharts-based funnel and area components in `frontend/src/components/analytics` to visualize conversion and growth.
- **Advanced Aggregates (Broken)**: `ReportController.php` lacks `BIT_OR`/`SUM` aggregation logic and Laravel Cache implementation.
  - *Sidebar Instruction*: Refactor `ReportController.php` to include weighted aggregates for branch performance and implement 1-hour caching via `Cache::remember`.

## [bulk import]
- **Bulk Allocation UI (0%)**: `BulkAllocationModal.jsx` for CSV/Excel lead assignment is missing.
  - *Sidebar Instruction*: Implement `BulkAllocationModal.jsx` using `react-dropzone` and integrate with a new `POST /api/hr/allocate-bulk` endpoint.
- **Round-Robin Algorithm (0%)**: Weighted round-robin logic for lead distribution is missing from the backend.
  - *Sidebar Instruction*: Create `allocateBulk` in `HRController` using `spatie/simple-excel` to parse chunks and distribute leads to 'Active' staff by weight.

## [native/store]
- **Biometric Authentication (0%)**: Biometric login bridge is missing from `Login.jsx` and `AuthContext.jsx`.
  - *Sidebar Instruction*: Integrate `@capacitor-community/biometric-auth` in `Login.jsx` to store and retrieve Sanctum tokens using `Capacitor Preferences`.
- **Deep-Linking Handling (0%)**: `App.jsx` lack listeners for native URL intents (`App.addListener('appUrlOpen')`).
  - *Sidebar Instruction*: Implement a deep-linking listener in `App.jsx` to route push notification payloads to specific lead profiles or announcements.
- **Capacitor Alignment (Broken)**: `capacitor.config.ts` uses an incorrect `appId` (`com.easyfinance.crm`) instead of the required `in.easyfinancewale.crm`.
  - *Sidebar Instruction*: Change `appId` to `in.easyfinancewale.crm` in `capacitor.config.ts` and regenerate native assets.
- **Placeholder Routes (Broken)**: 8+ routes in `App.jsx` (Settings, Announcements, Policies) are still using `ComingSoon` placeholders.
  - *Sidebar Instruction*: Replace `ComingSoon` placeholders in `App.jsx` with their functional component equivalents for Phase 4 readiness.
