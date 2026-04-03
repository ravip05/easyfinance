"# EasyFinanceCRM — PRD V3 (HR & Operations Focused)

**Version:** 3.0 — HR Operations Module
**Product:** EasyFinanceCRM — Loan Consultancy CRM
**Date:** April 2026

---

## 1. HR / Employee Module (4.6)
**Goal:** A "Full-Proof" system for managing the internal workforce with automated lifecycle notifications.

### 1.1 Employee Management
- **Employee CRUD**: Fields include Name, Phone, Email, Department, Seniority, Experience Years, Reference.
- **Auto-assign Virtual ID**: System automatically generates a unique Virtual ID (e.g., EF-2026-001) upon creation.
- **Status Management**: Activate, Deactivate, or Block users from accessing the system.
- **Role-Based Access**: Custom department categories with selectable access levels.
- **Search & Filter**: Robust search bar in employee list.

### 1.2 Leave Management (The "Full-Proof" Loop)
1. **Apply**: Staff/Manager applies for leave via HR portal (7 leave types supported).
2. **Review**: Admin/Manager receives and reviews the request.
3. **Action**: Admin/Manager Approves or Rejects the request.
4. **Notify**: System automatically triggers an Announcement notification to the Staff member.
5. **Announcement**: Approved leaves visible in the "Who's on Leave today" section.

### 1.3 Task & Payout
- **Task Allocation**: Ability to allocate tasks via Excel import.
- **Payout Ledger**: Secure view of payroll history and status.
- **Search**: Search bar in payout list for tracking transactions.

---

## 2. Franchise Module (4.7)
**Goal:** Empower business partners with transparency and support.

- **Unified Dashboard**: Same layout as Manager dashboard for consistency.
- **Franchise Reports**: Detailed business and branch-wise performance reports.
- **Support Interface**: Dedicated "Raise Issue" button that triggers an Admin-level Support Ticket.

---

## 3. Support Ticket System (4.8)
**Goal:** A centralized help desk for all stakeholders.

| Ticket Type | Created By | Received By | Purpose |
|------|-----------|------------|---------|
| **Client Support** | Staff/Manager | Assigned Staff | Handling customer loan issues |
| **Staff Issues** | Staff | Manager/Admin | Internal operational doubts/discussion |
| **Franchise Issues** | Franchise Owner | Admin | Partnership/payment issues |

- **Features**: Threaded replies, assign to specific user, priority levels (Low, Medium, High), status transitions (Open → In Progress → Resolved → Closed).

---

## 4. Knowledge Base / LMS (4.9)
- **Content Management**: Admin/Manager can update Bank Policy and Training materials.
- **Offline Mode**: Offline-readable via Service Worker caching.
- **Progress**: Track enrollment, lesson completion, and quiz scores.

---

## 5. Commission & Payout (4.11)
- **Configurable Rates**: Set commission % by department and role.
- **Automated Calculation**: Logic to calculate earnings based on disbursed loan amounts and role-based slabs.
- **Self-Service**: Staff can view their own commission history and payout status.

---

## 6. Announcements & Policy (4.12)
- **Global Broadcast**: Admin-created announcements received by all users.
- **Holiday Calendar**: "Full-Proof" calendar where adding holidays works flawlessly, categorizing them as Past/Upcoming.
- **Push Notifications**: Mandatory push notifications for Holidays and vital Announcements.
