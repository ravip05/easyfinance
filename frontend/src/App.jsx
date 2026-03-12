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
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import MainLayout   from './components/MainLayout'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Leads        from './pages/Leads'
import Clients      from './pages/Clients'
import Pipeline     from './pages/Pipeline'
import Calculator   from './pages/Calculator'
import Employees    from './pages/Employees'
import HR           from './pages/HR'
import Franchise    from './pages/Franchise'
import Reports      from './pages/Reports'

// ── Placeholder page for routes not yet built ─────────────────────────────────
// Replace each one with its real component as you build Step 4 and beyond.
function ComingSoon({ page }) {
  return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🚧</div>
      <div className="empty-text" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
        {page}
      </div>
      <div className="empty-text" style={{ marginTop: 6 }}>
        This page will be built in the next step.
      </div>
    </div>
  )
}

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
                    fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
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
        <Route path="employees"     element={<Employees />} />
        <Route path="franchise"     element={<Franchise />} />
        <Route path="bankpolicies"  element={<ComingSoon page="Bank Policies" />} />
        <Route path="lms"           element={<ComingSoon page="Training & LMS" />} />
        <Route path="reports"       element={<Reports />} />
        <Route path="announcements" element={<ComingSoon page="Announcements" />} />
        <Route path="calculator"    element={<Calculator />} />
        <Route path="cibil"         element={<ComingSoon page="CIBIL Checker" />} />
        <Route path="settings"      element={<ComingSoon page="Admin Settings" />} />
        <Route path="hr"            element={<HR />} />
        <Route path="duplicates"    element={<ComingSoon page="Duplicate Checker" />} />
        <Route path="idcard"        element={<ComingSoon page="ID Cards" />} />
        <Route path="myattendance"  element={<ComingSoon page="My Attendance" />} />
        <Route path="tickets"       element={<ComingSoon page="Support Tickets" />} />

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
