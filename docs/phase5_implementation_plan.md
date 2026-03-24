# Phase 5 Implementation Plan: Operational Excellence

Phase 5 focuses on completing the secondary modules, enhancing system performance, and finalizing the mobile/native user experience.

## 1. Bank Policies (Knowledge Base)
**Goal**: A central repository for bank guidelines and dynamic external links.

### Backend [MYSQL]
- **Migration**: `create_bank_policies_table`
  - `id`, `bank_name` (string), `category` (enum: Home, Personal, Business), `policy_url` (text), `description` (text), `is_active` (boolean).
- **Controller**: `BankPolicyController` (Admin: CRUD, Others: Index).

### Frontend [React]
- **Component**: `BankPolicies.jsx`
  - Search bar + Category tabs.
  - Policy cards with "View Details" (external link bridge).

---

## 2. Announcements & Role-Based Push
**Goal**: Targeted communication from management to staff.

### Backend [MYSQL]
- **Migration**: `create_announcements_table`
  - `id`, `title`, `content`, `target_role` (string: 'all', 'staff', 'manager', 'franchise'), `created_by` (fk), `expires_at` (date).
- **Logic**: Trigger `NewAnnouncementNotification` on creation.
  - Integrated with `FCM` (Android) and `APNs` (iOS) via Phase 4 push bridge.

### Frontend [React]
- **Component**: `Announcements.jsx`
  - Admin view: Simple form to broadcast.
  - User view: List of active announcements with "New" badge.

---

## 3. Settings & Profile Management
**Goal**: Personalization and biometric security toggles.

### Backend [API]
- **Endpoint**: `PUT /api/user/profile` (Update name, phone, password).
- **Endpoint**: `GET /api/user/settings` (Fetch preferences).

### Frontend [React]
- **Component**: `Settings.jsx`
  - **Profile Section**: Form to update basic info.
  - **Native Section**: 
    - "Biometric Authentication" toggle (calls `enrollBiometric` / `unenrollBiometric` from Phase 4).
    - "Dark Mode" toggle (persists to `Capacitor Preferences`).
- **Storage**: Uses `Capacitor Preferences` for cross-session UI state on mobile.

---

## 4. Performance & Reliability
**Goal**: Database optimization and recovery.

### Indexing [SQL]
- Add composite indexes to `leads` table:
  - `(stage, assigned_to)` - for Pipeline/Dashboard speed.
  - `(phone)` - for Duplicate Checker and Search speed.
  - `(created_at)` - for Reporting speed.

### Backups [Laravel]
- **Strategy**: Daily automated database dumps.
- **Implementation**: Schedule `mysqldump` via Laravel Scheduler or use `spatie/laravel-backup` to store snapshots in `storage/backups`.

---

## 5. Duplicate Checker
**Goal**: Maintain data integrity.

### Logic [Backend]
- **Endpoint**: `GET /api/leads/duplicates`
  - Returns groups of leads sharing the same `phone` or `pan_number`.
- **Component**: `Duplicates.jsx`
  - List of detected duplicates with a "Merge" or "Archive" action.

---

## Verification Plan

### Automated
- Verify that `App.jsx` deep-linking listener parses `/announcements` and `/settings` correctly.
- Stress test the searchable `BankPolicies` with 50+ entries.

### Manual
- Toggle Biometrics in Settings and verify it persists after app kill.
- Verify Push Notifications arrive for role-specific announcements.
