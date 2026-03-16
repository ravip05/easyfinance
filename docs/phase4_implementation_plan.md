# Phase 4 Implementation Plan: HR, Payroll, Advanced Analytics & Store Readiness

This blueprint defines the high-complexity logic pass for Phase 4, focusing on internal operations, financial transparency, and native ecosystem optimization.

---

## 1. Technical Breakdown

### 1.1 HR & Payroll Module
**React Components:**
- `EmployeeManagementTable.jsx`: Enhanced with inline status toggles, seniority indicators, and payroll shortcuts.
- `BulkAllocationModal.jsx`: CSV/Excel upload interface with column mapping logic for `assigned_to` and `loan_type`.
- `PayrollHistoryList.jsx`: Searchable ledger of all processed payouts for Admin and Managers.

**Laravel API Endpoints:**
- `POST /api/hr/allocate-bulk`: Accepts CSV/Excel file, parses via `spatie/simple-excel`, and assigns leads based on round-robin or department weight.
- `POST /api/hr/employees/{id}/seniority`: Update years of experience and track history for performance indexing.
- `GET /api/payroll/summary`: Aggregated data of pending vs. disbursed commissions.
- `POST /api/payroll/process`: Atomic transaction to mark a commission as "Paid", updating `payout_date` and generating a ledger entry.

**Database Interactions:**
- **Table `commission_slabs`**: Stores configurable rates.
  - `id, role, loan_type, min_amount, max_amount, rate_percentage, created_at`
- **Table `seniority_tracking`**: Audit log for employee growth.
  - `id, user_id, years_experience, changed_by, created_at`

---

### 1.2 Advanced Analytics Module
**React Components:**
- `AnalyticsFunnelChart.jsx`: Visualizes lead conversion rates from `New` → `Disbursed`.
- `RevenueGrowthChart.jsx`: Area chart showing monthly disbursed volume vs. previous year.
- `BranchPerformanceBar.jsx`: Comparison of revenue across different branches and franchise owners.
- `LeadBoard.jsx`: Real-time ranking of staff based on "Collection" (Disbursed Amount).

**Data Fetching & Optimization:**
- **Backend**: Use aggregate queries with `BIT_OR` or `SUM` on indexed columns. Cache results for 1 hour via Laravel Cache (`Cache::remember`).
- **Frontend**: SWR (Stale-While-Revalidate) with a 5-minute `refreshInterval` for real-time dashboards.

---

## 2. Coding Patterns

### 2.1 Excel/CSV Lead Import & Task Allocation
- **Pattern**: **Streamed Chunk Processing**.
- Avoid memory overflow by using PHP generators (`yield`) or Spatie's SimpleExcel.
- **Task Allocation Algorithm**:
  - Filter for "Active" and "In-Office" staff.
  - Distribute leads using a weight-based round-robin (Staff with higher seniority/performance get priority if enabled).

### 2.2 Automated Commission Engine
- **Pattern**: **Hook-Based Auto-Calc**.
- Trigger: `Lead::updated` event where `stage` changes to `Disbursed`.
- Logic:
  1. Retrieve `disbursed_amount` from lead.
  2. Lookup applicable slab in `commission_slabs` by `loan_type` and `user->role`.
  3. Calculate: `amount = disbursed_amount * slab_rate`.
  4. Create record in `commissions` table with `status = 'Pending'`.

### 2.3 State Management for Large-Scale Reports
- **Pattern**: **Paginated Local Cache**.
- Fetch reports in 50-row chunks.
- Store in Dexie.js `dashboardCache` for instant offline filtering and sorting without re-fetching from API.

---

## 3. PWA/Native Integration (Capacitor 7.0)

### 3.1 Store Readiness Configuration
- **Capacitor Config**: Update `appId` (`in.easyfinancewale.crm`) and `appName` for production.
- **Asset Bundling**:
  - Source: `src/assets/branding/logo.png`
  - Tool: `npx @capacitor/assets generate --android --ios` (Generates splash screens, adaptive icons, and notification icons).
- **Security Check**: Enable `biometric-auth` for all Finance-related modules (Payroll/Client Data).

### 3.2 Deep-Linking Strategy
- **Announcements**: Push payload includes `route: "/announcements/{id}"`.
- **Lead Follow-up**: Push payload includes `route: "/leads/{id}"`.
- **Implementation**: `App.addListener('appUrlOpen', (data) => { ... })` in `App.jsx` to handle incoming link intents.

---

## 4. Verification Plan

### Automated Tests
- `CommissionCalculationTest.php`: Assert that different slabs yield correct amounts for various loan types.
- `BulkImportTest.php`: Verify that a 500-row CSV allocates leads correctly across 5 different staff members.
- `RBACAnalyticsTest.php`: Ensure Managers only see analytics for their own teams.

### Manual Verification
- **Native Check**: Build APK and verify that deep-linking from a push notification opens the correct lead profile.
- **Offline Check**: Disable network, perform lead search (via Dexie), and re-enable to see sync status update.
- **Asset Check**: Verify splash screen resolution on both a notched iPhone and a standard Android tablet.
