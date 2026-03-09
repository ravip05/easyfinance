/**
 * pages/Login.jsx
 *
 * Faithful React conversion of the .login-screen section in LoanCRM_v9.html.
 *
 * Features preserved from the prototype:
 *   ✓ Role selector grid (4 cards, one selected at a time)
 *   ✓ Email pre-fill when a role card is clicked (fills the demo credential)
 *   ✓ Password eye-toggle (show / hide)
 *   ✓ Demo Accounts panel with "Use" quick-fill buttons
 *   ✓ Error banner with the server's message
 *   ✓ Loading state on the Sign In button
 *   ✓ All original CSS class names preserved
 *
 * Changes from the prototype:
 *   • doLogin() → calls AuthContext.login() instead of raw fetch()
 *   • selectRole() → setState instead of DOM manipulation
 *   • fillDemo() → setState instead of direct input value assignment
 *   • togglePassView() → useState instead of DOM toggle
 */
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// ── Role definitions (mirrors ROLE_CONFIG from the prototype) ─────────────────
const ROLES = [
  { key: 'admin',   icon: '🛡️', label: 'Super Admin',     sub: 'Full access' },
  { key: 'manager', icon: '👔', label: 'Manager',          sub: 'Team lead'   },
  { key: 'staff',   icon: '👤', label: 'Staff / Executive', sub: 'Field agent' },
  { key: 'dsa',     icon: '🤝', label: 'DSA / Franchise',  sub: 'Partner'     },
]

// ── Demo credentials (mirrors DEMO_USERS from the prototype) ──────────────────
const DEMO_ACCOUNTS = [
  { label: '🛡️ Admin',   email: 'admin@easyfinancewale.in',     password: 'admin123', role: 'admin'   },
  { label: '👔 Manager', email: 'priya@easyfinancewale.in',     password: 'mgr123',   role: 'manager' },
  { label: '👤 Staff',   email: 'amit@easyfinancewale.in',      password: 'staff123', role: 'staff'   },
  { label: '🤝 DSA',     email: 'mumbaidsa@easyfinancewale.in', password: 'dsa123',   role: 'dsa'     },
]

export default function Login() {
  const { login } = useAuth()

  // ── Form state ─────────────────────────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email,        setEmail]        = useState('admin@easyfinancewale.in')
  const [password,     setPassword]     = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [isLoading,    setIsLoading]    = useState(false)

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * selectRole — mirrors selectRole() from the prototype.
   * Clicking a role card highlights it AND pre-fills the matching demo credential.
   */
  function handleRoleSelect(roleKey) {
    setSelectedRole(roleKey)
    setError('')

    // Auto-fill the matching demo account so the user can sign in immediately
    const demo = DEMO_ACCOUNTS.find((d) => d.role === roleKey)
    if (demo) {
      setEmail(demo.email)
      setPassword(demo.password)
    }
  }

  /**
   * fillDemo — mirrors fillDemo() from the prototype.
   * The "Use" link in the demo accounts panel fills email + password + role.
   */
  function handleFillDemo(demo) {
    setSelectedRole(demo.role)
    setEmail(demo.email)
    setPassword(demo.password)
    setError('')
  }

  /**
   * doLogin — mirrors doLogin() from the prototype.
   * Calls AuthContext.login() which POSTs to /api/auth/login.
   * On success, AuthContext updates the user state and React Router
   * navigates to /dashboard via the ProtectedRoute in App.jsx.
   */
  async function handleSubmit(e) {
    // Support both button click and Enter key (form submit)
    e?.preventDefault?.()
    if (isLoading) return

    setError('')
    setIsLoading(true)

    try {
      await login(email.trim().toLowerCase(), password)
      // Navigation is handled by App.jsx PublicRoute → redirect to /dashboard
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Connection error. Is the Laravel server running?'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Enter key in the password field submits the form
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="login-screen">
      <div className="login-card">

        {/* ── Logo ── */}
        <div className="login-logo">
          <div className="login-logo-icon">💰</div>
          <div className="login-logo-text">
            EasyFinance CRM
            <span>Loan Consultancy Platform</span>
          </div>
        </div>

        {/* ── Heading ── */}
        <div className="login-title">Welcome back 👋</div>
        <div className="login-sub">Select your role and sign in to continue</div>

        {/* ── Role selector grid ── */}
        <div className="login-role-grid" id="role-select-grid">
          {ROLES.map((role) => (
            <div
              key={role.key}
              className={`role-btn${selectedRole === role.key ? ' selected' : ''}`}
              onClick={() => handleRoleSelect(role.key)}
              data-role={role.key}
            >
              <div className="rb-icon">{role.icon}</div>
              <div className="rb-label">{role.label}</div>
              <div className="rb-sub">{role.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Credentials ── */}
        <div className="form-group">
          <div className="form-label">Email / Username</div>
          <input
            className="form-input"
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <div className="form-label">Password</div>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              id="login-pass"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              id="pass-eye"
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                fontSize: 16, cursor: 'pointer',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="login-error show" id="login-error">
            {error}
          </div>
        )}

        {/* ── Submit ── */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '11px', fontSize: '14px' }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in…' : 'Sign In →'}
        </button>

        {/* ── Demo accounts ── */}
        <div className="demo-accounts">
          <div className="demo-accounts-title">Demo Accounts</div>
          {DEMO_ACCOUNTS.map((demo) => (
            <div className="demo-row" key={demo.role}>
              <span className="demo-name">{demo.label}</span>
              <span className="demo-creds">
                {demo.email.split('@')[0]}… / {demo.password}
              </span>
              <span
                className="demo-fill"
                onClick={() => handleFillDemo(demo)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleFillDemo(demo)}
              >
                Use
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
