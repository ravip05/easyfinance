/**
 * App.jsx
 *
 * Root router configuration.  All routes are declared here so the whole
 * app's navigation structure is visible in one place.
 *
 * Route groups:
 *   /login              — public, redirects to /dashboard if already logged in
 *   /                   — protected, wrapped in MainLayout
 *     /dashboard        — role-aware dashboard (Step 4)
 *     /leads            — lead management table + pipeline (Step 4)
 *     /clients          — client profiles (Step 4)
 *     /pipeline         — kanban board (Step 4)
 *     /employees        — team management (Step 4)
 *     /franchise        — franchise overview (Step 4)
 *     /bankpolicies     — bank policy reference (Step 4)
 *     /lms              — training LMS (Step 4)
 *     /reports          — analytics (Step 4)
 *     /announcements    — broadcast messages (Step 4)
 *     /calculator       — loan calculator (Step 4)
 *     /cibil            — CIBIL checker (Step 4)
 *     /settings         — admin settings (Step 4)
 *     /hr               — HR module (Step 4)
 *
 * ProtectedRoute redirects unauthenticated users to /login.
 * PublicRoute redirects already-authenticated users to /dashboard.
 */
import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
const isNative = typeof window !== 'undefined' && !!window.Capacitor;
import { useAuth } from './context/AuthContext'

import MainLayout      from './components/MainLayout'
import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import Leads           from './pages/Leads'
import Clients         from './pages/Clients'
import Pipeline        from './pages/Pipeline'
import Calculator      from './pages/Calculator'
import Employees       from './pages/Employees'
import HR              from './pages/HR'
import Franchise       from './pages/Franchise'
import Reports         from './pages/Reports'
import IDCard          from './pages/IDCard'
import Tickets         from './pages/Tickets'
import LeadBoard       from './pages/LeadBoard'
import LMS             from './pages/LMS'
import BankPolicies    from './pages/BankPolicies'
import Announcements   from './pages/Announcements'
import CibilChecker    from './pages/CibilChecker'
import AdminSettings   from './pages/AdminSettings'
import UserSettings    from './pages/UserSettings'
import Duplicates      from './pages/Duplicates'
import MyAttendance      from './pages/MyAttendance'
import PolicyManagement  from './pages/PolicyManagement'
import Profile           from './pages/Profile'
import Tasks             from './pages/Tasks'
import TeamChat          from './pages/TeamChat'


// ── Route guards ──────────────────────────────────────────────────────────────

/**
 * ProtectedRoute
 * Renders its children only when the user is authenticated.
 * While the auth context is still loading (session restore), renders nothing
 * to prevent a flash of the login screen on valid page refreshes.
 */
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    // Render the app shell background while we validate the stored token.
    // Using the same CSS variable as the prototype so there's no colour flash.
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--text3)',
                    fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
        Loading…
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

/**
 * PublicRoute
 * Redirects already-authenticated users away from /login.
 */
function PublicRoute({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    // ── Deep Linking ───────────────────────────────────────────────────────────
    // Handles incoming URL intents (e.g. easyfinance://leads/123)
    const setupDeepLinking = async () => {
      CapApp.addListener('appUrlOpen', (event) => {
        // Example: in.easyfinancewale.crm://leads/123 -> /leads/123
        const slug = event.url.split('://').pop()
        if (slug) {
          navigate(slug.startsWith('/') ? slug : `/${slug}`)
        }
      })
    }

    if (isNative && CapApp) {
      setupDeepLinking()
    }

    // Clean up
    return () => {
      if (isNative && CapApp) {
        CapApp.removeAllListeners()
      }
    }
  }, [navigate])

  return (
    <Routes>
      {/* ── Public ── */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ── Protected — all wrapped inside MainLayout ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Default: redirect / → /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* ── Core pages (built in Step 4) ── */}
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="leads"        element={<Leads />} />
        <Route path="clients"      element={<Clients />} />

        {/* ── Remaining pages — ComingSoon placeholders ── */}
        <Route path="pipeline"      element={<Pipeline />} />
        <Route path="leadboard"     element={<LeadBoard />} />
        <Route path="employees"     element={<Employees />} />
        <Route path="franchise"     element={<Franchise />} />
        <Route path="bankpolicies"  element={<BankPolicies />} />
        <Route path="lms"           element={<LMS />} />
        <Route path="reports"       element={<Reports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="calculator"    element={<Calculator />} />
        <Route path="cibil"         element={<CibilChecker />} />
        <Route path="settings"      element={<AdminSettings />} />
        <Route path="hr"            element={<HR />} />
        <Route path="duplicates"       element={<Duplicates />} />
        <Route path="idcard"           element={<IDCard />} />
        <Route path="myattendance"     element={<MyAttendance />} />
        <Route path="tickets"          element={<Tickets />} />
        <Route path="policy-management" element={<PolicyManagement />} />
        <Route path="profile"          element={<UserSettings />} />
        <Route path="tasks"            element={<Tasks />} />
        <Route path="team-chat"        element={<TeamChat />} />

        {/* Catch-all within the layout → 404 inside the shell */}
        <Route
          path="*"
          element={
            <div className="empty" style={{ paddingTop: 80 }}>
              <div className="empty-icon">🔍</div>
              <div className="empty-text">Page not found.</div>
            </div>
          }
        />
      </Route>

      {/* Catch-all outside layout → back to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
