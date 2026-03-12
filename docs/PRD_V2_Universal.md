# EasyFinanceCRM — Product Requirements Document (PRD)

**Version:** 3.0 — PWA + Native Pivot
**Product:** EasyFinanceCRM — Loan Consultancy CRM
**Date:** March 2026

---

## 1. Product Overview

EasyFinanceCRM is a **Progressive Web App (PWA)** that will be packaged as native APK/IPA using **Capacitor 7.0** for Play Store and App Store distribution. It manages the full loan consultancy lifecycle:

**Lead → Qualification → Loan Processing → Disbursement → Commission → Support**

### 1.1 Platform Strategy

| Channel | Technology | Distribution |
|---------|-----------|-------------|
| **Web** | React PWA (Vite) | Vercel — installable via browser |
| **Android** | Capacitor 7.0 APK | Google Play Store |
| **iOS** | Capacitor 7.0 IPA | Apple App Store |
| **Backend** | Laravel 11 API | Hostinger |

> [!IMPORTANT]
> The application is **PWA-first**: one React codebase serves web, Android, and iOS. Capacitor bridges native APIs (push notifications, camera, biometrics, file system) without requiring separate native codebases.

---

## 2. Target Users

| Role | Description | Platform |
|------|-------------|----------|
| **Admin** | CRM owner / company management | Web + Mobile |
| **Manager** | Team lead managing staff | Web + Mobile |
| **Staff** | Loan advisor handling leads in the field | **Primarily Mobile** |
| **Franchise Owner** | External DSA business partner | Web + Mobile |
| **Client** | Loan applicant (limited portal access) | **Mobile only** |

---

## 3. Core Requirements

### 3.1 PWA & Offline-First

| Module | Offline Requirement |
|--------|-------------------|
| **Lead Management** | Full CRUD offline. Queue syncs when online. |
| **LMS / Knowledge Base** | Read-only offline. Courses/materials cached. |
| **Calculator** | Fully offline (client-side math). |
| **Dashboard** | Show last-cached stats; badge "offline" indicator. |

### 3.2 Native Capabilities (via Capacitor 7.0)

| Capability | Plugin | Usage |
|-----------|--------|-------|
| Push Notifications | `@capacitor/push-notifications` | Follow-up reminders, announcements on lock screen |
| Camera / Gallery | `@capacitor/camera` | Document uploads (loan papers, ID proofs) |
| Biometric Auth | `@capacitor-community/biometric-auth` | Fingerprint / Face ID login on mobile |
| File System | `@capacitor/filesystem` | Offline document cache |
| Share | `@capacitor/share` | Virtual visiting card sharing |
| App Badge | `@capacitor/badge` | Unread notification count |
| Splash Screen | `@capacitor/splash-screen` | Branded launch screen |
| Status Bar | `@capacitor/status-bar` | Immersive mobile experience |

### 3.3 Responsive Design 2.0

| Rule | Web | Mobile App |
|------|-----|-----------|
| Footer | ❌ No footer | ❌ No footer |
| Bottom Nav | ❌ Hidden | ✅ **5-tab bottom navigation bar** |
| Sidebar | ✅ Collapsible | ❌ Hidden (replaced by bottom nav + hamburger) |
| Touch targets | 36px min | **48px min** (Play Store / App Store requirement) |
| Font sizes | 12-14px | **14-16px min** |
| Safe areas | N/A | iOS notch + Android nav bar respected |

### 3.4 Push Notifications (Lock Screen)

Notification triggers:
1. Follow-up reminder (scheduled — lead's `follow_up_date + follow_up_time`)
2. New lead assigned to you
3. Lead stage changed
4. New announcement from admin
5. Company holiday notification
6. Support ticket reply
7. Commission approved / payout processed

---

## 4. Module Requirements

### 4.1 Authentication Module

**All roles: Admin, Manager, Staff, Franchise Owner, Client**

| Feature | Details |
|---------|---------|
| Email + password login | Existing |
| **Phone + password login** | New — phone field in login form |
| Role selector (dropdown) | 5 roles: Admin, Manager, Staff, Franchise, Client |
| **Biometric login (mobile)** | Fingerprint / Face ID after first successful login |
| Token persistence | Sanctum token stored securely; biometric unlocks token |
| Demo accounts panel | Quick-fill for testing |

### 4.2 Dashboard Module

**Admin Dashboard:**
- KPI cards: new leads, clients, employees, monthly profit
- Graphs: business overview by team, branch, franchise, loan type
- Leaderboard (employee performance by collection)
- Follow-up reminders

**Manager Dashboard:**
- Department/team progress + self-progress
- Commissions earned
- Team leaderboard

**Staff Dashboard:**
- Self-details and progress reports
- Own leads overview
- Commission and payout summary

**Franchise Dashboard:**
- Same as Manager dashboard (PRD requirement #11)
- Franchise-specific leads and performance

**Client Dashboard (New):**
- View own loan application status
- View/upload documents
- Raise support tickets

### 4.3 Lead Management Module

**Lead Fields (Complete):**

| Field | Type | Required |
|-------|------|----------|
| Name | Text | ✅ |
| Phone | Text (10-digit) | ✅ |
| Birth Date | Date (auto age calc) | |
| Location | Text (city/state) | |
| Loan Type | Select | ✅ |
| Income Status | Select (Salaried/Self-Employed/Business) | |
| Monthly Salary/Income | Number | |
| Running Loans | Number | |
| Previous Issues | Text | |
| CIBIL Score | Number (300-900) | |
| Lead Valuation | Currency | |
| Lead Status/Stage | Select (pipeline stages) | ✅ |
| Follow-up Date & Time | DateTime | |
| Documents | File uploads (camera + gallery + file picker) | |
| Document Name | Text (per document) | |
| Priority | Select (High/Medium/Low) | |
| Assigned To | Select (user) | |
| Source | Select | |
| Notes | Text | |

**Lead Operations:**
1. CRUD (Create, Read, Update, Delete)
2. Change status directly from list page via dropdown
3. **Import via CSV/Excel** — assignable to specific user or department
4. Export to CSV
5. **Filters:** by days, months, quarterly, custom date range, + stage, loan type, priority
6. **Offline-capable:** leads created offline queue for sync

### 4.4 Pipeline (Kanban)

Stages: New → Contacted → Docs Pending → Docs Received → CIBIL → Login → Processing → Sanctioned → Disbursed → Closed

- Drag-and-drop stage updates
- Stage counters
- Overdue highlights
- Loan-type chip filters

### 4.5 Client File Progress Module

- Convert lead → client when loan processing begins
- Loan process status tracking
- Add/remove documents (camera, gallery, file picker)
- Inform client feature
- Client bill/payment status
- Individual client detail view with all documents

### 4.6 HR / Employee Module

- Employee CRUD: name, phone, department, seniority, experience years, reference
- Commission management per employee
- Task list + allocate tasks via Excel
- Manage payout
- Status: activate/deactivate/block
- Search bar in employee list and payout list
- Create roles for employees
- Role-based commissions
- Role-based auto team allocation
- Custom department categories with selectable access
- **Auto-assign Virtual ID** to users

### 4.7 Franchise Module

- Same dashboard as Manager
- Franchise business details/reports
- Branch/franchise reports
- Raise issue/support ticket (admin receives)

### 4.8 Support Ticket System

Three ticket types:

| Type | Created By | Received By |
|------|-----------|------------|
| **Client Support** | Staff/Manager on behalf of client | Assignable, reply, change status |
| **Staff Issues** | Staff (inhouse use only) | Manager/Admin |
| **Franchise Issues** | Franchise owner | Admin |

- Employee/Staff/Team doubts/discussion module (like support ticket)
- Reply, assign, change status on all ticket types

### 4.9 Knowledge Base / LMS

- Text, PDF, images, video links
- Admin and Manager can update content
- Bank policy updates
- **Offline-readable** — cached via service worker
- Course enrollment, progress tracking, quizzes

### 4.10 CIBIL Score Module

- Admin uploads 3rd-party website links for CIBIL testing
- Staff can access and use the links

### 4.11 Commission & Payout

- Commission rates configurable by department
- Role-based commission calculation
- Payout management
- Self-commission and payout history (Staff view)

### 4.12 Announcements & Policy

- Company announcements (admin creates, all receive)
- Holiday calendar
- Company policy documents
- Push notifications for holidays and announcements

### 4.13 Staff-Specific Features

- **Virtual Visiting Card** — download and share (native Share API)
- Loan calculator (EMI, Eligibility, FOIR)
- CIBIL score checker
- Self-commission & payout history
- **Follow-up reminder push notification on lock screen**
- Redirect query to designated manager or team

### 4.14 Reports & Analytics

- Lead conversion reports
- Employee productivity
- Revenue reports
- Branch/franchise performance
- **Extensive filters** on all report pages (date, branch, franchise, loan type)

---

## 5. Design Requirements

1. Simple, elegant, **100% responsive** design
2. **No footer** on web — mobile uses bottom navigation bar instead
3. Touch targets: **48px minimum** for store compliance
4. Add filters wherever possible
5. Push notifications
6. Notifications for company holidays and announcements
7. Bottom navigation bar (mobile only): Dashboard, Leads, Pipeline, More (hamburger for remaining)

---

## 6. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite PWA) |
| **Native Wrapper** | Capacitor 7.0 |
| **Backend** | Laravel 11 |
| **Auth** | Laravel Sanctum + Biometric bridge |
| **Database** | MySQL 8.0 |
| **Push** | Firebase Cloud Messaging (Android) + APNs (iOS) + Web Push API |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Hostinger |
| **App Stores** | Google Play Store + Apple App Store |

---

## 7. Engineering Roadmap

| Phase | Modules | Duration |
|-------|---------|----------|
| **Phase 1** — Core CRM | Lead edit/detail, Lead filters, Client module, PWA manifest + service worker | 4 weeks |
| **Phase 2** — Operations | HR module, Franchise dashboard, Reports UI, Capacitor integration | 6 weeks |
| **Phase 3** — Support & Training | LMS (offline), Support tickets, Announcements, Holidays | 4 weeks |
| **Phase 4** — Advanced | Commission system, Push notifications, Biometric auth, Store submission | 4 weeks |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load < 2s; offline-first for critical modules |
| **Security** | Sanctum auth, RBAC, biometric token persistence, secure file upload |
| **Scalability** | 1,000+ users, 100,000+ leads |
| **Offline** | Lead CRUD, LMS read, Calculator — all functional without internet |
| **Store Compliance** | 48px touch targets, proper splash screens, app icons, push notification permissions |
