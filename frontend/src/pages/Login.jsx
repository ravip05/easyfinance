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
 *
 * Phase 4 additions:
 *   ✓ Biometric login button (native only)
 *   ✓ Auto-detect biometric availability on mount
 *   ✓ Graceful fallback to password form
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { isBiometricAvailable, isBiometricEnrolled } from '../services/biometricAuth'

// ── Role definitions (mirrors ROLE_CONFIG from the prototype) ─────────────────
const ROLES = [
  { key: 'admin',     icon: '🛡️', label: 'Super Admin',     sub: 'Full access' },
  { key: 'manager',   icon: '👔', label: 'Manager',          sub: 'Team lead'   },
  { key: 'staff',     icon: '👤', label: 'Staff / Executive', sub: 'Field agent' },
  { key: 'franchise', icon: '🤝', label: 'Franchise Partner',sub: 'Partner'     },
  { key: 'client',    icon: '📱', label: 'Client',          sub: 'Customer'    },
]

// ── Demo credentials (mirrors DEMO_USERS from the prototype) ──────────────────
const DEMO_ACCOUNTS = [
  { label: '🛡️ Admin',   email: 'admin@easyfinancewale.in',     password: 'admin123', role: 'admin'   },
  { label: '👔 Manager', email: 'priya@easyfinancewale.in',     password: 'mgr123',   role: 'manager' },
  { label: '👤 Staff',   email: 'amit@easyfinancewale.in',      password: 'staff123', role: 'staff'   },
  { label: '🤝 DSA',     email: 'mumbaidsa@easyfinancewale.in', password: 'dsa123',   role: 'dsa'     },
]

export default function Login() {
  const { login, loginWithBiometric } = useAuth()

  // ── Form state ─────────────────────────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email,        setEmail]        = useState('admin@easyfinancewale.in')
  const [password,     setPassword]     = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [isLoading,    setIsLoading]    = useState(false)

  // ── Biometric state ────────────────────────────────────────────────────────
  const [biometricReady, setBiometricReady] = useState(false)
  const [bioLoading,     setBioLoading]     = useState(false)

  // Check biometric availability on mount
  useEffect(() => {
    ;(async () => {
      const available = await isBiometricAvailable()
      const enrolled  = await isBiometricEnrolled()
      setBiometricReady(available && enrolled)
    })()
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleRoleSelect(roleKey) {
    setSelectedRole(roleKey)
    setError('')
    const demo = DEMO_ACCOUNTS.find((d) => d.role === roleKey)
    if (demo) {
      setEmail(demo.email)
      setPassword(demo.password)
    }
  }

  function handleFillDemo(demo) {
    setSelectedRole(demo.role)
    setEmail(demo.email)
    setPassword(demo.password)
    setError('')
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (isLoading) return

    setError('')
    setIsLoading(true)

    try {
      await login(email.trim().toLowerCase(), password, selectedRole)
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

  /**
   * handleBiometricLogin — prompts fingerprint / Face ID
   * Falls back to password form with error message on failure.
   */
  async function handleBiometricLogin() {
    if (bioLoading) return
    setBioLoading(true)
    setError('')

    try {
      const result = await loginWithBiometric()
      if (!result.success) {
        setError(result.error || 'Biometric authentication failed. Use password.')
      }
      // On success, AuthContext updates user state → PublicRoute redirects to /dashboard
    } catch {
      setError('Biometric authentication failed. Please use your password.')
    } finally {
      setBioLoading(false)
    }
  }

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

        {/* ── Biometric unlock button (native only, enrolled) ── */}
        {biometricReady && (
          <button
            id="biometric-login-btn"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '15px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, var(--accent2, #10b981), var(--accent, #2563eb))',
              border: 'none',
              borderRadius: 12,
            }}
            onClick={handleBiometricLogin}
            disabled={bioLoading}
          >
            {bioLoading ? '🔐 Verifying…' : '🔐 Unlock with Biometric'}
          </button>
        )}

        {/* ── Role selector dropdown ── */}
        <div className="form-group">
          <div className="form-label">Login as</div>
          <select 
            className="form-select"
            value={selectedRole}
            onChange={(e) => handleRoleSelect(e.target.value)}
          >
            {ROLES.map((role) => (
              <option key={role.key} value={role.key}>
                {role.icon} {role.label}
              </option>
            ))}
          </select>
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
          style={{ width: '100%', padding: '11px', fontSize: '14px', fontFamily: 'Inter, sans-serif', backgroundColor: '#2563eb' }}
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
