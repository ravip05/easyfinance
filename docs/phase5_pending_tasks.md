# Phase 5: Pending Operational Tasks

This document tracks items from the Phase 5 (Operational Excellence) plan that require manual backend integration or additional frontend features.

## 1. Duplicate Lead Resolution
**Status**: Detection is 100% (Backend + UI), but Resolution is 0% (Stubs only).
- [ ] **Merge Logic**: `POST /api/leads/merge` endpoint. Needs logic to transfer `LeadNote`, `LeadDocument`, and `LeadTimeline` entries from source leads to a master lead before deleting the duplicates.
- [ ] **Frontend Wiring**: Connect the "Merge" button in `Duplicates.jsx` to an actual confirmation modal and merge API.

## 2. Attendance & Geofencing (4.13)
**Status**: Page exists as a placeholder (`MyAttendance.jsx`).
- [ ] **Migration**: `create_attendances_table` (id, user_id, check_in_at, check_out_at, latitude, longitude, status).
- [ ] **Controller**: `AttendanceController` with `store` (Check-in) and `update` (Check-out).
- [ ] **Native Integration**: Use `Capacitor Geolocation` to verify the user is within a permitted radius (Office/Home) before allowing check-in.

## 3. CIBIL Checker Bridge (4.11)
**Status**: Page exists as a placeholder (`CibilChecker.jsx`).
- [ ] **Backend Integration**: Implement a bridge to a CIBIL soft-pull API or a manual upload/parse logic for credit reports.
- [ ] **Lead Sync**: Automatically update `leads.cibil_score` when a check is performed for a lead's PAN.

## 4. Policy Management (Admin UI)
**Status**: Staff-view is 100%, but Admin-upload is 0%.
- [ ] **Admin Page**: Create `PolicyManagement.jsx` (visible to 'admin' only) to let managers add/edit/delete policies (consuming `Route::apiResource('bank-policies')`).

## 5. Automated Push Notifications
**Status**: Announcements are live, but push triggers need testing.
- [ ] **Logic**: Ensure `NewAnnouncementNotification` sends actual Firebase/APNs payloads to users who have registered their device tokens (using the `PushDevice.php` model from Phase 4).

## 6. Performance Monitoring
- [ ] **Audit Trail**: Ensure `AuditLog` captures policy changes and attendance check-ins.
- [ ] **Query Review**: Verify that the new `(stage, assigned_to)` composite index is actually used by the `LeadBoard` and `Dashboard` queries in production.
