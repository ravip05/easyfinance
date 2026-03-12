# EasyFinanceCRM — Technical Design Document (TDD)

**Version:** 3.0 — PWA + Capacitor Native Pivot
**Product:** EasyFinanceCRM — Loan Consultancy CRM
**Date:** March 2026
**Based on:** PRD v3.0 + Codebase Audit + CRM Updates.docx

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [PWA & Service Worker Strategy](#4-pwa--service-worker-strategy)
5. [Capacitor 7.0 Native Bridge](#5-capacitor-70-native-bridge)
6. [Push Notification Architecture](#6-push-notification-architecture)
7. [Offline Data Sync Engine](#7-offline-data-sync-engine)
8. [Authentication & Biometric Security](#8-authentication--biometric-security)
9. [Database Schema](#9-database-schema)
10. [API Design](#10-api-design)
11. [Frontend Architecture](#11-frontend-architecture)
12. [Responsive 2.0 & Mobile Navigation](#12-responsive-20--mobile-navigation)
13. [Document Upload & Camera Bridge](#13-document-upload--camera-bridge)
14. [Module Technical Specifications](#14-module-technical-specifications)
15. [Performance & Scalability](#15-performance--scalability)
16. [Security](#16-security)
17. [Deployment & Store Submission](#17-deployment--store-submission)
18. [Testing Strategy](#18-testing-strategy)

---

## 1. System Overview

### 1.1 Platform Strategy

EasyFinanceCRM is a **single React codebase** delivered through three channels:

```
React App (Vite)
    ├── Web PWA ──────────→ Vercel (installable via browser)
    ├── Android APK ──────→ Google Play Store (Capacitor 7.0)
    └── iOS IPA ──────────→ Apple App Store (Capacitor 7.0)
```

### 1.2 Current vs. Target State

| Component | Current | Target |
|-----------|---------|--------|
| Frontend | React SPA (no PWA) | PWA with service worker + offline |
| Native | None | Capacitor 7.0 (Android + iOS) |
| Push | None | FCM (Android) + APNs (iOS) + Web Push |
| Auth | Sanctum token only | Sanctum + biometric unlock |
| Camera | None | Native camera + gallery via Capacitor |
| Offline | None | IndexedDB + background sync for leads |
| Navigation | Sidebar only | Sidebar (web) + bottom nav (mobile) |
| Roles | 4 (admin, manager, staff, dsa) | 5 (+ client role) |

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  React PWA (Vite) + Service Worker + Capacitor Shell    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐ │
│  │ Web Push │  │ IndexedDB│  │ Capacitor Plugins     │ │
│  │ API      │  │ (offline)│  │ Camera | Biometric    │ │
│  │          │  │          │  │ Push   | FileSystem   │ │
│  └──────────┘  └──────────┘  └───────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / JSON
┌────────────────────────▼────────────────────────────────┐
│                     API Layer                            │
│  Laravel 11 · Sanctum · REST API · Queue Worker         │
├───────────┬─────────────┬──────────────┬────────────────┤
│ MySQL 8.0 │ File Storage│ FCM / APNs   │ Audit Logs    │
│           │ (storage/)  │ (push server)│               │
└───────────┴─────────────┴──────────────┴────────────────┘
```

### 2.2 Request Flow — Online

```
User Action → React Component → API Module (axios)
                                    ↓
                              Online? ──YES──→ Laravel API → MySQL → Response
                                │
                               NO
                                ↓
                         IndexedDB Queue → Background Sync (when reconnected)
```

### 2.3 Request Flow — Native (Capacitor)

```
User Action → React Component → Capacitor.isNativePlatform()?
                                    ↓                    ↓
                                  YES                   NO
                                    ↓                    ↓
                            Native Plugin          Web API fallback
                        (Camera/Push/Bio)       (file input, Web Push)
```

---

## 3. Technology Stack

### 3.1 Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 18.x |
| Build Tool | Vite | 5.x + vite-plugin-pwa |
| Router | React Router DOM | 6.x |
| HTTP Client | Axios | 1.x |
| State | React Context + IndexedDB | — |
| PWA | Workbox (via vite-plugin-pwa) | 7.x |
| Offline DB | Dexie.js (IndexedDB wrapper) | 4.x |
| Native Shell | Capacitor | **7.0** |

### 3.2 Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Laravel | 11.x |
| Auth | Laravel Sanctum | 4.x |
| Database | MySQL | 8.0+ |
| Push Server | laravel-notification-channels/fcm | — |
| Queue | Database driver (→ Redis in production) | — |
| File Storage | Local disk / S3-compatible | — |

### 3.3 Capacitor Plugins

| Plugin | Purpose | Platform |
|--------|---------|----------|
| `@capacitor/push-notifications` | Native push on lock screen | Android + iOS |
| `@capacitor/camera` | Photo capture + gallery | Android + iOS |
| `@capacitor-community/biometric-auth` | Fingerprint / Face ID | Android + iOS |
| `@capacitor/filesystem` | Offline file cache | Android + iOS |
| `@capacitor/share` | Share virtual card | Android + iOS |
| `@capacitor/badge` | App icon badge count | Android + iOS |
| `@capacitor/splash-screen` | Branded launch | Android + iOS |
| `@capacitor/status-bar` | Status bar styling | Android + iOS |
| `@capacitor/keyboard` | Keyboard management | Android + iOS |
| `@capacitor/haptics` | Touch feedback | Android + iOS |
| `@capacitor/network` | Online/offline detection | Android + iOS |
| `@capacitor/preferences` | Secure key-value store | Android + iOS |

---

## 4. PWA & Service Worker Strategy

### 4.1 PWA Manifest

```json
// public/manifest.json
{
  "name": "EasyFinance CRM",
  "short_name": "EasyFinCRM",
  "description": "Loan Consultancy Management Platform",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1e3a5f",
  "background_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### 4.2 Service Worker Strategy (Workbox)

**Configuration via `vite-plugin-pwa`:**

```js
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // ── App Shell: Cache First ──
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          // ── API: Network First with offline fallback ──
          {
            urlPattern: /\/api\/leads/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'leads-api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── LMS Content: Stale While Revalidate ──
          {
            urlPattern: /\/api\/lms\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lms-content-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 }, // 7 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Dashboard Stats: Network First (short cache) ──
          {
            urlPattern: /\/api\/dashboard/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashboard-cache',
              expiration: { maxAgeSeconds: 300 }, // 5 min
              networkTimeoutSeconds: 3,
            },
          },
          // ── Static Assets: Cache First ──
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 }, // 30 days
            },
          },
          // ── LMS Materials (PDFs, videos): Cache First ──
          {
            urlPattern: /\/storage\/lms-materials\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lms-materials-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 2592000 },
              rangeRequests: true, // video streaming support
            },
          },
        ],
      },
    }),
  ],
})
```

### 4.3 Caching Strategy Per Module

| Module | Strategy | Cache Name | TTL | Offline Behavior |
|--------|----------|-----------|-----|-----------------|
| **App Shell** | Cache First (precache) | `workbox-precache` | ∞ (versioned) | Full app loads from cache |
| **Lead List** | Network First | `leads-api-cache` | 24h | Shows last-cached list |
| **Lead CRUD** | IndexedDB queue | `offline-mutations` | Until synced | Full offline CRUD |
| **Dashboard** | Network First | `dashboard-cache` | 5 min | Shows stale stats + "offline" badge |
| **LMS Courses** | Stale While Revalidate | `lms-content-cache` | 7 days | Full read access |
| **LMS Materials** | Cache First | `lms-materials-cache` | 30 days | PDFs/videos available offline |
| **Calculator** | Precached (client-side) | App shell | ∞ | Fully offline |
| **Knowledge Base** | Stale While Revalidate | `lms-content-cache` | 7 days | Full read access |
| **Auth Token** | Capacitor Preferences | Device-level | Persistent | Biometric re-auth |
| **Images/Icons** | Cache First | `image-cache` | 30 days | Cached |

### 4.4 Background Sync

```js
// Service worker: background sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-leads') {
    event.waitUntil(syncOfflineLeads());
  }
});

async function syncOfflineLeads() {
  const db = await openDB('offline-queue');
  const mutations = await db.getAll('lead-mutations');

  for (const mutation of mutations) {
    try {
      await fetch(mutation.url, {
        method: mutation.method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(mutation.payload),
      });
      await db.delete('lead-mutations', mutation.id);
    } catch (e) {
      break; // Will retry on next sync event
    }
  }
}
```

---

## 5. Capacitor 7.0 Native Bridge

### 5.1 Project Structure

```
EasyFinanceCRM/
├── frontend/              # React PWA source
│   ├── src/
│   ├── public/
│   ├── capacitor.config.ts
│   └── package.json
├── android/               # Generated by Capacitor (gitignored until CI)
├── ios/                   # Generated by Capacitor (gitignored until CI)
└── backend/               # Laravel API
```

### 5.2 Capacitor Configuration

```ts
// frontend/capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.easyfinancewale.crm',
  appName: 'EasyFinance CRM',
  webDir: 'dist',
  server: {
    // Production: serve from built assets
    // Development: proxy to Vite dev server
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#2563eb',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

### 5.3 Platform Detection Utility

```js
// src/utils/platform.js
import { Capacitor } from '@capacitor/core';

export const isNative    = Capacitor.isNativePlatform();
export const isAndroid   = Capacitor.getPlatform() === 'android';
export const isIOS       = Capacitor.getPlatform() === 'ios';
export const isWeb       = Capacitor.getPlatform() === 'web';

// Feature flags
export const hasCamera   = isNative;
export const hasBiometric = isNative;
export const hasNativePush = isNative;
```

### 5.4 Build & Deploy Commands

```bash
# Development
npm run dev                          # Vite dev server (web)
npx cap sync                        # Sync web assets to native projects
npx cap open android                 # Open in Android Studio
npx cap open ios                     # Open in Xcode

# Production Build
npm run build                        # Vite production build → dist/
npx cap sync                        # Sync to native
# Android: Build APK/AAB via Android Studio or CLI
cd android && ./gradlew assembleRelease
# iOS: Archive via Xcode
```

---

## 6. Push Notification Architecture

### 6.1 Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│ Laravel Backend                                       │
│                                                       │
│  Event (lead assigned, follow-up due, etc.)           │
│           ↓                                           │
│  Laravel Notification                                 │
│           ↓                                           │
│  ┌────────┴──────────┐                               │
│  │ Channel Router    │                               │
│  ├───────────────────┤                               │
│  │ database channel  │──→ In-app notification feed    │
│  │ fcm channel       │──→ FCM Server ──→ Android     │
│  │ apns channel      │──→ APNs Server ──→ iOS        │
│  │ web-push channel  │──→ Web Push ──→ Browser PWA   │
│  └───────────────────┘                               │
└──────────────────────────────────────────────────────┘
```

### 6.2 Native Push Setup (Capacitor)

```js
// src/services/pushNotifications.js
import { PushNotifications } from '@capacitor/push-notifications';
import { isNative } from '../utils/platform';
import apiClient from '../api/client';

export async function initPushNotifications() {
  if (!isNative) {
    // Web: use Web Push API + service worker
    return initWebPush();
  }

  // Native: Capacitor Push Notifications plugin
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  // Device token received — send to backend
  PushNotifications.addListener('registration', async (token) => {
    await apiClient.post('/api/push-subscriptions', {
      platform: Capacitor.getPlatform(),     // 'android' | 'ios'
      token: token.value,                     // FCM token (Android) or APNs token (iOS)
    });
  });

  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // Show in-app toast or update badge count
    showInAppNotification(notification);
  });

  // User tapped notification (app was in background/killed)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    // Deep-link to relevant screen
    handleNotificationDeepLink(action.notification.data);
  });
}
```

### 6.3 Web Push Setup (PWA)

```js
async function initWebPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY,
  });

  // Send subscription to backend
  await apiClient.post('/api/push-subscriptions', {
    platform: 'web',
    subscription: subscription.toJSON(),
  });
}
```

### 6.4 Backend Push Service

```php
// app/Notifications/FollowUpReminder.php
class FollowUpReminder extends Notification
{
    public function via($notifiable): array
    {
        $channels = ['database'];  // always store in DB

        // Add push channel based on user's registered devices
        $devices = $notifiable->pushDevices;
        if ($devices->where('platform', 'android')->count()) $channels[] = 'fcm';
        if ($devices->where('platform', 'ios')->count())     $channels[] = 'apns';
        if ($devices->where('platform', 'web')->count())     $channels[] = 'webpush';

        return $channels;
    }

    public function toFcm($notifiable): FcmMessage
    {
        return FcmMessage::create()
            ->setNotification(FcmNotification::create()
                ->setTitle('Follow-up Due: ' . $this->lead->name)
                ->setBody($this->lead->loan_type . ' · ' . $this->lead->amount_formatted)
            )
            ->setData([
                'type'    => 'follow_up',
                'lead_id' => (string) $this->lead->id,
                'route'   => '/leads',
            ]);
    }
}
```

### 6.5 Push Device Registration (Schema)

```sql
CREATE TABLE push_devices (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL FK→users,
    platform    ENUM('android','ios','web') NOT NULL,
    token       TEXT NOT NULL,           -- FCM token, APNs token, or Web Push subscription JSON
    device_name VARCHAR(100) NULLABLE,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    INDEX(user_id, platform)
);
```

### 6.6 Scheduled Push (Follow-up Reminders)

```php
// app/Console/Kernel.php — scheduled command
$schedule->command('leads:send-followup-reminders')
         ->everyFifteenMinutes();

// The command:
// 1. Query leads where follow_up_date = today AND follow_up_time <= now
// 2. For each, send FollowUpReminder notification to assigned user
// 3. Mark as notified to prevent duplicate sends
```

---

## 7. Offline Data Sync Engine

### 7.1 Architecture

```
┌──────────────────────────────┐
│ React Component              │
│ useLeads() / useOfflineSync()│
└──────────┬───────────────────┘
           │
    ┌──────▼──────┐
    │ Sync Layer  │
    │ (Dexie.js)  │
    ├─────────────┤
    │ IndexedDB   │          ┌─────────┐
    │ ┌─────────┐ │          │ Laravel │
    │ │ leads   │ │◄────────►│  API    │
    │ │ queue   │ │  Online  │         │
    │ │ cache   │ │  Sync    │         │
    │ └─────────┘ │          └─────────┘
    └─────────────┘
```

### 7.2 IndexedDB Schema (Dexie.js)

```js
// src/db/offlineDb.js
import Dexie from 'dexie';

export const db = new Dexie('EasyFinanceCRM_Offline');

db.version(1).stores({
  // Cached lead records for offline viewing
  leads: 'id, name, phone, stage, assigned_to, follow_up_date, *_syncStatus',

  // Offline mutation queue (pending API calls)
  mutations: '++id, type, endpoint, method, payload, createdAt',

  // Cached LMS content
  lmsContent: 'id, type, courseId, title',

  // Cached dashboard stats
  dashboardCache: 'key, data, updatedAt',
});
```

### 7.3 Offline CRUD Flow

```js
// src/hooks/useOfflineLeads.js
import { db } from '../db/offlineDb';
import { useNetwork } from './useNetwork';

export function useOfflineLeads() {
  const { isOnline } = useNetwork();

  async function createLead(payload) {
    if (isOnline) {
      // Online: normal API call + cache result
      const result = await apiClient.post('/api/leads', payload);
      await db.leads.put(result.data.data);
      return result;
    } else {
      // Offline: save to IndexedDB + queue mutation
      const tempId = `temp_${Date.now()}`;
      const offlineLead = { ...payload, id: tempId, _syncStatus: 'pending' };
      await db.leads.put(offlineLead);
      await db.mutations.add({
        type: 'CREATE_LEAD',
        endpoint: '/api/leads',
        method: 'POST',
        payload,
        createdAt: new Date().toISOString(),
      });

      // Register background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register('sync-leads');
      }

      return { ok: true, data: offlineLead, offline: true };
    }
  }

  // Same pattern for updateLead, updateStage, deleteLead...
}
```

### 7.4 Conflict Resolution

| Scenario | Strategy |
|----------|----------|
| Same lead edited online + offline | **Last-write-wins** with server timestamp |
| Lead deleted on server while offline edit pending | Discard offline edit, show toast |
| Stage changed on server while offline stage change pending | Server wins, show diff toast |
| Network restored after long offline period | Full re-sync via `GET /api/leads?updated_after=TIMESTAMP` |

### 7.5 Online/Offline Detection

```js
// src/hooks/useNetwork.js
import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { isNative } from '../utils/platform';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (isNative) {
      // Capacitor: more reliable network detection
      Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
      return () => Network.removeAllListeners();
    } else {
      // Web fallback
      const on  = () => setIsOnline(true);
      const off = () => setIsOnline(false);
      window.addEventListener('online', on);
      window.addEventListener('offline', off);
      return () => {
        window.removeEventListener('online', on);
        window.removeEventListener('offline', off);
      };
    }
  }, []);

  return { isOnline };
}
```

---

## 8. Authentication & Biometric Security

### 8.1 Auth Flow — Full

```
┌─────────────────────────────────────────────────────┐
│ App Launch                                           │
│      ↓                                               │
│ Has stored token? ──NO──→ Login Screen               │
│      ↓ YES                    │                      │
│ Is native? ──NO──→ Auto-login with token             │
│      ↓ YES                                           │
│ Biometric enrolled? ──NO──→ Auto-login with token    │
│      ↓ YES                                           │
│ Prompt biometric ──PASS──→ Auto-login with token     │
│      ↓ FAIL                                          │
│ Show login screen (fallback to password)             │
└─────────────────────────────────────────────────────┘
```

### 8.2 Biometric Implementation

```js
// src/services/biometricAuth.js
import { BiometricAuth } from '@capacitor-community/biometric-auth';
import { Preferences } from '@capacitor/preferences';
import { isNative } from '../utils/platform';

export async function isBiometricAvailable() {
  if (!isNative) return false;
  try {
    const result = await BiometricAuth.isAvailable();
    return result.has;
  } catch { return false; }
}

export async function enrollBiometric(token) {
  // Store encrypted token reference
  await Preferences.set({ key: 'auth_token', value: token });
  await Preferences.set({ key: 'biometric_enrolled', value: 'true' });
}

export async function authenticateWithBiometric() {
  try {
    await BiometricAuth.authenticate({
      reason: 'Unlock EasyFinance CRM',
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or Face ID',
      negativeButtonText: 'Use Password',
    });
    // Success: retrieve stored token
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    return { success: true, token };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 8.3 Token Persistence Strategy

| Platform | Storage | Security |
|----------|---------|----------|
| Web | `localStorage` | Standard (cleared on logout) |
| Android | `@capacitor/preferences` → Android EncryptedSharedPreferences | AES-256 |
| iOS | `@capacitor/preferences` → iOS Keychain | Hardware-backed |

### 8.4 Phone Number Login

```php
// AuthController@login — updated
public function login(Request $request): JsonResponse
{
    $request->validate([
        'login'    => 'required|string',
        'password' => 'required|string',
    ]);

    // Determine field: email or phone
    $login = trim($request->login);
    $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

    $user = User::where($field, $login)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials.',
        ], 401);
    }

    $token = $user->createToken('mobile-app')->plainTextToken;

    return response()->json([
        'success' => true,
        'data' => [
            'token' => $token,
            'user'  => $this->formatUser($user),
        ],
    ]);
}
```

### 8.5 Client Role

New role `client` added to the RBAC system:

```php
// users.role ENUM: 'admin','manager','staff','dsa','client'

// Client permissions:
// - View own loan applications (leads/clients where phone matches)
// - Upload documents to own application
// - Raise support tickets
// - View announcements
// - NO access to: other leads, employees, franchises, settings, reports
```

---

## 9. Database Schema

### 9.1 Schema Modifications

#### `users` table — new columns + Client role

```sql
-- Add 'client' to role enum
ALTER TABLE users MODIFY COLUMN role
    ENUM('admin','manager','staff','dsa','client') DEFAULT 'staff';

-- New columns
ALTER TABLE users ADD COLUMN virtual_id VARCHAR(20) UNIQUE NULLABLE;
ALTER TABLE users ADD COLUMN experience_years TINYINT UNSIGNED DEFAULT 0;
ALTER TABLE users ADD COLUMN seniority
    ENUM('Junior','Mid','Senior','Lead','Director') DEFAULT 'Junior';
ALTER TABLE users ADD COLUMN reference VARCHAR(255) NULLABLE;
```

#### `leads` table — new fields from CRM Updates.docx

```sql
ALTER TABLE leads ADD COLUMN birth_date DATE NULLABLE;
ALTER TABLE leads ADD COLUMN location VARCHAR(200) NULLABLE;
ALTER TABLE leads ADD COLUMN income_status
    ENUM('Salaried','Self-Employed','Business','Retired','Other') NULLABLE;
ALTER TABLE leads ADD COLUMN running_loans TINYINT UNSIGNED DEFAULT 0;
ALTER TABLE leads ADD COLUMN previous_issues TEXT NULLABLE;
ALTER TABLE leads ADD COLUMN cibil_score SMALLINT UNSIGNED NULLABLE;
ALTER TABLE leads ADD COLUMN lead_value DECIMAL(15,2) NULLABLE;
ALTER TABLE leads ADD COLUMN follow_up_time TIME NULLABLE;
```

### 9.2 New Tables

#### `push_devices`
```sql
CREATE TABLE push_devices (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    platform    ENUM('android','ios','web') NOT NULL,
    token       TEXT NOT NULL,
    device_name VARCHAR(100) NULLABLE,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX(user_id, platform)
);
```

#### `tickets`
```sql
CREATE TABLE tickets (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number  VARCHAR(20) UNIQUE NOT NULL,
    type           ENUM('client','staff','franchise') NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT NOT NULL,
    status         ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
    priority       ENUM('low','medium','high','urgent') DEFAULT 'medium',
    created_by     BIGINT UNSIGNED NOT NULL,
    assigned_to    BIGINT UNSIGNED NULLABLE,
    client_id      BIGINT UNSIGNED NULLABLE,
    franchise_id   BIGINT UNSIGNED NULLABLE,
    resolved_at    TIMESTAMP NULLABLE,
    closed_at      TIMESTAMP NULLABLE,
    created_at     TIMESTAMP,
    updated_at     TIMESTAMP,
    INDEX(type, status),
    INDEX(assigned_to, status),
    INDEX(created_by)
);
```

#### `ticket_replies`
```sql
CREATE TABLE ticket_replies (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id   BIGINT UNSIGNED NOT NULL,
    user_id     BIGINT UNSIGNED NOT NULL,
    message     TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
```

#### `holidays`
```sql
CREATE TABLE holidays (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    date        DATE NOT NULL,
    type        ENUM('national','regional','company') DEFAULT 'company',
    is_optional BOOLEAN DEFAULT FALSE,
    created_by  BIGINT UNSIGNED NULLABLE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    UNIQUE(date, title)
);
```

#### `company_policies`
```sql
CREATE TABLE company_policies (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    category      VARCHAR(100) DEFAULT 'general',
    content       LONGTEXT NOT NULL,
    version       VARCHAR(10) DEFAULT '1.0',
    is_active     BOOLEAN DEFAULT TRUE,
    published_at  TIMESTAMP NULLABLE,
    created_by    BIGINT UNSIGNED NULLABLE,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);
```

#### `virtual_cards`
```sql
CREATE TABLE virtual_cards (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED UNIQUE NOT NULL,
    virtual_id   VARCHAR(20) UNIQUE NOT NULL,
    designation  VARCHAR(100) NULLABLE,
    tagline      VARCHAR(255) NULLABLE,
    whatsapp     VARCHAR(15) NULLABLE,
    linkedin     VARCHAR(255) NULLABLE,
    qr_code_path VARCHAR(255) NULLABLE,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

> [!NOTE]
> Existing tables (`leads`, `clients`, `franchises`, `payouts`, `announcements`, `commission_slabs`, `commissions`, `cibil_checks`, `departments`, `settings`, `audit_logs`, `lead_timelines`, `lead_notes`, `lead_documents`, `client_documents`, LMS tables) remain unchanged. See TDD v2.0 for their full schemas.

---

## 10. API Design

### 10.1 New Endpoints (PWA Pivot)

#### Push Device Registration
```
POST   /api/push-subscriptions        Register device for push
DELETE /api/push-subscriptions/{id}    Unregister device
```

#### Offline Sync
```
GET    /api/leads?updated_after=ISO    Leads modified after timestamp (for delta sync)
POST   /api/leads/batch               Batch-create leads from offline queue
POST   /api/sync/leads                Sync offline mutations (create/update/stage change)
```

#### Client Portal (New Role)
```
GET    /api/client/applications        Client views own loan applications
GET    /api/client/applications/{id}   Application detail + documents
POST   /api/client/applications/{id}/documents   Upload document
POST   /api/client/tickets             Raise support ticket
GET    /api/client/tickets             View own tickets
```

> [!NOTE]
> All existing endpoints from TDD v2.0 remain unchanged. See Section 6 of TDD v2.0 for the complete list of 22 existing + 40+ planned endpoints.

---

## 11. Frontend Architecture

### 11.1 Updated File Structure

```
frontend/src/
├── api/                    # API modules (existing + new)
├── components/
│   ├── BottomNav.jsx       # [NEW] Mobile bottom navigation bar
│   ├── OfflineBanner.jsx   # [NEW] "You are offline" indicator
│   ├── CameraUpload.jsx    # [NEW] Camera/gallery document capture
│   ├── DateRangeFilter.jsx # [NEW] Date range filter component
│   └── ...existing...
├── context/
│   ├── AuthContext.jsx     # Updated for biometric flow
│   └── ...existing...
├── db/
│   └── offlineDb.js        # [NEW] Dexie.js IndexedDB schema
├── hooks/
│   ├── useNetwork.js       # [NEW] Online/offline detection
│   ├── useOfflineLeads.js  # [NEW] Offline lead CRUD
│   └── usePlatform.js      # [NEW] Platform detection hook
├── services/
│   ├── pushNotifications.js # [NEW] Push registration
│   ├── biometricAuth.js     # [NEW] Biometric auth service
│   ├── offlineSync.js       # [NEW] Background sync engine
│   └── cameraService.js     # [NEW] Camera/gallery bridge
├── utils/
│   └── platform.js          # [NEW] Capacitor platform detection
├── pages/                   # Existing + new pages
├── sw-custom.js             # [NEW] Custom service worker extensions
├── capacitor.config.ts      # [NEW] Capacitor configuration
└── ...existing...
```

---

## 12. Responsive 2.0 & Mobile Navigation

### 12.1 Bottom Navigation Bar (Mobile Only)

Visible **only** on native platforms and when viewport ≤ 768px:

```jsx
// src/components/BottomNav.jsx
const TABS = [
  { key: 'dashboard', icon: '📊', label: 'Home',     path: '/dashboard' },
  { key: 'leads',     icon: '🎯', label: 'Leads',    path: '/leads' },
  { key: 'pipeline',  icon: '🔄', label: 'Pipeline', path: '/pipeline' },
  { key: 'more',      icon: '☰',  label: 'More',     path: null }, // opens drawer
];
```

**CSS Rules:**
```css
/* Bottom nav: visible only on mobile */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;                          /* 48px content + 12px safe area */
  padding-bottom: env(safe-area-inset-bottom);  /* iOS notch */
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 1000;
}

@media (max-width: 768px) {
  .bottom-nav { display: flex; }
  .sidebar    { display: none; }        /* Hide sidebar on mobile */
  .main-content { padding-bottom: 72px; } /* Space for bottom nav */
}

/* Touch targets: 48px minimum for store compliance */
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 48px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

### 12.2 Touch Target Requirements

| Element | Minimum Size | Notes |
|---------|-------------|-------|
| Buttons | 48 × 48px | Google Material / Apple HIG |
| List items | 48px height | Minimum tappable row |
| Form inputs | 44px height | With 16px font (prevents iOS zoom) |
| Checkboxes | 44 × 44px | Touch-friendly wrapper |
| Dropdown triggers | 48px height | Full-width on mobile |
| Tab bar items | 48 × 48px | Including icon + label |
| Pipeline cards | Full width | No cramped grid on mobile |

### 12.3 Safe Areas

```css
/* iOS safe areas (notch, home indicator) */
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  --safe-right: env(safe-area-inset-right);
}

.topbar {
  padding-top: calc(8px + var(--safe-top));
}

.bottom-nav {
  padding-bottom: var(--safe-bottom);
}

.sidebar {
  padding-top: var(--safe-top);
}
```

### 12.4 Responsive Breakpoints

| Breakpoint | Target | Layout |
|-----------|--------|--------|
| ≤ 480px | Phone (portrait) | Single column, bottom nav, no sidebar |
| 481–768px | Phone (landscape) / small tablet | Two-column grid, bottom nav |
| 769–1024px | Tablet | Sidebar + content, no bottom nav |
| ≥ 1025px | Desktop | Full sidebar + wide content |

---

## 13. Document Upload & Camera Bridge

### 13.1 Unified Upload Component

```jsx
// src/components/CameraUpload.jsx
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNative } from '../utils/platform';

export default function CameraUpload({ onCapture, accept = 'image/*,.pdf' }) {
  async function handleNativeCapture(source) {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: source,                    // CameraSource.Camera or CameraSource.Photos
        quality: 85,
        allowEditing: false,
        width: 1920,                       // max dimension
        correctOrientation: true,
      });

      // Convert base64 to File object for consistent upload API
      const blob = base64ToBlob(image.base64String, `image/${image.format}`);
      const file = new File([blob], `doc_${Date.now()}.${image.format}`, {
        type: `image/${image.format}`,
      });
      onCapture(file);
    } catch (e) {
      if (e.message !== 'User cancelled photos app') {
        console.error('Camera error:', e);
      }
    }
  }

  if (isNative) {
    // Native: show camera + gallery buttons
    return (
      <div className="upload-options">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleNativeCapture(CameraSource.Camera)}
          style={{ minHeight: 48 }}
        >
          📷 Take Photo
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleNativeCapture(CameraSource.Photos)}
          style={{ minHeight: 48 }}
        >
          🖼 Gallery
        </button>
        <label className="btn btn-ghost btn-sm" style={{ minHeight: 48 }}>
          📁 File
          <input type="file" accept={accept} hidden
                 onChange={(e) => e.target.files[0] && onCapture(e.target.files[0])} />
        </label>
      </div>
    );
  }

  // Web: standard file input
  return (
    <label className="btn btn-primary btn-sm upload-btn" style={{ minHeight: 48 }}>
      📎 Upload Document
      <input type="file" accept={accept} hidden
             onChange={(e) => e.target.files[0] && onCapture(e.target.files[0])} />
    </label>
  );
}
```

### 13.2 Upload API Flow

```
Camera/Gallery/File Picker
     ↓
  File object
     ↓
  FormData (multipart/form-data)
     ↓
  Online? ──YES──→ POST /api/{resource}/documents
     │                      ↓
    NO                 Save to server storage + DB record
     ↓
  Cache in IndexedDB (base64)
  + Queue mutation for sync
```

---

## 14. Module Technical Specifications

> [!NOTE]
> All module specs from TDD v2.0 Section 8 remain valid. This section adds **PWA-specific** and **Capacitor-specific** extensions only.

### 14.1 Lead Management — Offline Extensions

- **Offline create:** Lead saved to IndexedDB with `_syncStatus: 'pending'`, shows with orange "sync pending" badge in list
- **Offline stage change:** Queued as mutation, reflected immediately in UI
- **Reconnection:** Background sync processes queue; resolved leads get server IDs; temp IDs updated
- **Conflict indicator:** If server version differs from cached version, show yellow "updated on server" badge

### 14.2 LMS — Offline Reading

- On first visit to a course, all lessons are fetched and cached in `lms-content-cache`
- PDF materials are cached via service worker `CacheFirst` strategy
- Video URLs are cached headers only (streaming); no full video download
- Offline indicator shows cached vs. uncached content

### 14.3 Dashboard — Offline Mode

- When offline, display last-cached stats from IndexedDB `dashboardCache`
- Show prominent "Offline — data may be outdated" banner
- Hide real-time elements (leaderboard live badge)
- Calculator page is fully offline (client-side math, no API)

### 14.4 Virtual Visiting Card — Native Share

```js
import { Share } from '@capacitor/share';

async function shareVirtualCard(cardData) {
  if (isNative) {
    await Share.share({
      title: `${cardData.name} - EasyFinance`,
      text: `Contact ${cardData.name} at ${cardData.phone}`,
      url: cardData.shareUrl,
      dialogTitle: 'Share Virtual Card',
    });
  } else {
    // Web: navigator.share() or copy link fallback
    if (navigator.share) {
      await navigator.share({ title: cardData.name, url: cardData.shareUrl });
    } else {
      navigator.clipboard.writeText(cardData.shareUrl);
    }
  }
}
```

---

## 15. Performance & Scalability

### 15.1 PWA Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| First Contentful Paint | < 1.5s | Precached app shell |
| Time to Interactive | < 3s | Code splitting + lazy routes |
| Largest Contentful Paint | < 2.5s | Optimized images, font preload |
| Offline startup | < 1s | Entire shell served from cache |
| Background sync | < 30s | Queued mutations processed in order |

### 15.2 App Size Targets

| Platform | Target | Strategy |
|---------|--------|----------|
| PWA bundle | < 500 KB gzipped | Tree-shaking, code splitting |
| Android APK | < 15 MB | Vite build + Capacitor shell |
| iOS IPA | < 20 MB | Same + required iOS assets |

---

## 16. Security

### 16.1 RBAC for 5 Roles

| Resource | Admin | Manager | Staff | Franchise | Client |
|----------|-------|---------|-------|-----------|--------|
| All Leads | ✅ | Team | Own | Franchise | ❌ |
| Own Application | — | — | — | — | ✅ |
| Create Lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Employees | ✅ | Team view | ❌ | ❌ | ❌ |
| Franchises | ✅ | ❌ | ❌ | Own | ❌ |
| LMS | ✅ Edit | ✅ Edit | ✅ View | ✅ View | ❌ |
| Tickets | ✅ All | ✅ Assigned | ✅ Own | ✅ Own | ✅ Own |
| Announcements | ✅ Create | ✅ View | ✅ View | ✅ View | ✅ View |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ Team | ❌ | ✅ Own | ❌ |
| Documents Upload | ✅ | ✅ | ✅ | ✅ | ✅ Own |

### 16.2 Token Security by Platform

| Platform | Storage | Protection |
|----------|---------|-----------|
| Web | localStorage | XSS mitigation via CSP headers |
| Android | EncryptedSharedPreferences | AES-256-GCM, hardware-backed keystore |
| iOS | Keychain | Hardware Secure Enclave |

### 16.3 Biometric Security Flow

```
First Login (any platform):
  email/phone + password → Sanctum token
  ↓
  Native? → Prompt "Enable biometric unlock?"
  ↓ YES
  Verify biometric → Store token in secure storage → Enable auto-login

Subsequent App Opens (native only):
  Has stored token? → Prompt biometric
  ↓ SUCCESS → Validate token via GET /api/auth/me
  ↓ 401 (expired) → Show login screen
  ↓ FAIL biometric → Show login screen (password fallback)
```

---

## 17. Deployment & Store Submission

### 17.1 Web (PWA)

```bash
npm run build           # Vite → dist/ with service worker
# Deploy to Vercel (auto via git push)
```

### 17.2 Android (Play Store)

```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease   # → app-release.aab

# Requirements:
# - Signed with upload key (keystore)
# - Target API level 34+ (Android 14)
# - 48px touch targets
# - Push notification permission dialog
# - Camera permission dialog
```

### 17.3 iOS (App Store)

```bash
npm run build
npx cap sync ios
# Open in Xcode → Product → Archive → Distribute

# Requirements:
# - Apple Developer Program ($99/yr)
# - Provisioning profile + signing certificate
# - Info.plist: camera, push, photo library usage descriptions
# - Safe area compliance
# - App Transport Security (HTTPS only)
```

### 17.4 Store Compliance Checklist

| Requirement | Android | iOS |
|------------|---------|-----|
| App icons (all sizes) | ✅ mipmap sets | ✅ AppIcon.appiconset |
| Splash screen | ✅ Capacitor plugin | ✅ Capacitor plugin |
| Push permission dialog | ✅ Runtime prompt | ✅ Runtime prompt |
| Camera permission | ✅ AndroidManifest | ✅ Info.plist NSCameraUsageDescription |
| Gallery permission | ✅ AndroidManifest | ✅ Info.plist NSPhotoLibraryUsageDescription |
| Biometric permission | ✅ AndroidManifest | ✅ Info.plist NSFaceIDUsageDescription |
| HTTPS only | ✅ android:usesCleartextTraffic=false | ✅ ATS enforced |
| Touch targets 48px | ✅ Design system | ✅ Design system |
| Privacy policy URL | ✅ Store listing | ✅ Store listing |

---

## 18. Testing Strategy

### 18.1 PWA Testing

| Test | Tool | What |
|------|------|------|
| Lighthouse | Chrome DevTools | PWA score ≥ 90, performance, accessibility |
| Service worker | Chrome → Application tab | Cache inspection, offline simulation |
| Offline mode | Chrome → Network → Offline | Verify all offline-capable modules |
| Install prompt | Chrome mobile | Verify install banner works |

### 18.2 Capacitor / Native Testing

| Test | Tool | What |
|------|------|------|
| Android build | Android Studio | APK build, emulator testing |
| iOS build | Xcode | Simulator testing, device signing |
| Push notifications | Firebase Console | Send test notification to device |
| Camera | Physical device | Photo capture, gallery pick |
| Biometric | Physical device | Fingerprint / Face ID flow |
| Offline sync | Airplane mode | CRUD queue, reconnection sync |

### 18.3 Cross-Platform Test Matrix

| Feature | Chrome | Safari | Android APK | iOS IPA |
|---------|--------|--------|-------------|---------|
| Login | ✅ | ✅ | ✅ | ✅ |
| Biometric | ❌ (N/A) | ❌ (N/A) | ✅ | ✅ |
| Push on lock screen | ⚠️ Web Push | ⚠️ Web Push | ✅ FCM | ✅ APNs |
| Camera capture | ❌ (file input) | ❌ (file input) | ✅ | ✅ |
| Offline leads | ✅ SW | ✅ SW | ✅ | ✅ |
| Bottom nav | ✅ (mobile viewport) | ✅ | ✅ | ✅ |
| Safe areas | N/A | N/A | ✅ | ✅ |

---

*End of Technical Design Document v3.0*
