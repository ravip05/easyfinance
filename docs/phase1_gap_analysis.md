# Phase 1: Gap Analysis Report — EasyFinanceCRM

**Objective:** Map existing frontend/backend state against the new PWA-first, 5-role, Capacitor-ready requirements.

---

## 1. PWA & Native Readiness (Capacitor 7.0)

Current state: Standard React/Vite SPA.

| Requirement | Status | Gap |
|-------------|--------|-----|
| **PWA Manifest** | ❌ Missing | No `manifest.json` or icons in `public/`. |
| **Service Worker** | ❌ Missing | No Workbox integration or `sw.js`. No offline caching. |
| **Capacitor Config** | ❌ Missing | No `capacitor.config.ts` or native project folders (`android/`/`ios/`). |
| **Dependencies** | ❌ Missing | Missing `vite-plugin-pwa`, `dexie`, `@capacitor/core`, `@capacitor/push-notifications`, etc. |
| **Native Bridge** | ❌ Missing | `LeadModal.jsx` uses standard `<input type="file">`. No Camera/Gallery API. |
| **Offline Sync** | ❌ Missing | App relies on direct Axios calls. No IndexedDB queue/sync logic. |
| **Biometrics** | ❌ Missing | Auth flow is standard email/phone + password. No native re-auth. |

---

## 2. Role-Based Access (RBAC) — 5 Roles

Requirement: Admin, Manager, Staff, Franchise Owner, Client.

| Role | Frontend Status | Backend Status | Gap |
|------|-----------------|----------------|-----|
| **Admin** | ✅ Configured | ✅ Configured | None |
| **Manager** | ✅ Configured | ✅ Configured | None |
| **Staff** | ✅ Configured | ✅ Configured | None |
| **Franchise (dsa)** | ✅ Configured | ✅ Configured | Name mismatch ("dsa" in DB vs "franchise" in PRD). |
| **Client** | ❌ **Missing** | ❌ **Missing** | No `client` role in `Sidebar.jsx`, `User` model, or route guards. |

---

## 3. Lead Module Audit

Comparison against `CRM Updates.docx` (Docx Source 6).

### 3.1 Field Gaps (Backend & Frontend)

| Required Field | Status | Requirement Detail |
|----------------|--------|-------------------|
| **Birth Date** | ❌ Missing | Needed for auto age calculation. |
| **Location** | ❌ Missing | Required for lead demographics. |
| **Income Status** | ❌ Missing | Salaried / Self-Employed / Business. |
| **Running Loans** | ❌ Missing | Count of current financial liabilities. |
| **Previous Issues** | ❌ Missing | Text field for lead history. |
| **CIBIL Score** | ❌ Missing | Numerical score (300-900). |
| **Lead Valuation** | ❌ Missing | Estimated business value of the lead. |
| **Follow-up Time** | ❌ Missing | Current system only has `follow_up_date`. |

### 3.2 Feature Gaps

| Feature | Status | Gap |
|---------|--------|-----|
| **Inline Status Change** | ⚠️ Partial | Implemented in `LeadsList.jsx` for table view, but missing from detail views. |
| **Lead Import** | ❌ Missing | UI button exists but logic is missing. No Excel/CSV parser. |
| **Advanced Filters** | ❌ Missing | Missing: filtering by days, months, quarterly, and custom date range. |
| **Bulk Assignment** | ❌ Missing | No "Assign via Excel/CSV" feature. |
| **Lead Support Tickets**| ❌ Missing | No ticket system linked to leads. |

---

## 4. Mobile UI (Responsive 2.0)

| Requirement | Status | Gap |
|-------------|--------|-----|
| **No Footer Rule** | ✅ Success | Current code has no footer in the main layout. |
| **Bottom Nav Bar** | ❌ Missing | No mobile-only navigation bar for native builds. |
| **Touch Targets** | ⚠️ Pending | Many buttons/inputs likely < 48px. Audit required. |
| **Safe Areas** | ❌ Missing | No `env(safe-area-inset-*)` padding for iOS notch/home indicator. |

---

## 5. Summary and Risks

1. **Client Role**: The biggest functional gap. Requires schema updates, backend scope revisions, and a new portal UI.
2. **Offline Architecture**: Moving from Axios-only to IndexedDB sync is a major architectural shift.
3. **Database Schema**: Significant `ALTER TABLE` operations needed for existing `leads` and `users` tables.
4. **Capacitor Integration**: Deployment pipeline for Android/iOS needs setup from scratch.

**Conclusion:** The current frontend is a solid React foundation but lacks all PWA/Native infrastructure. Phase 1 must focus on establishing the PWA shell and expanding the Lead schema.
