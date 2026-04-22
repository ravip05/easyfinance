/**
 * context/AuthContext.jsx
 *
 * Single source of truth for authentication state across the app.
 *
 * Exposes:
 *   user      — the current user object (or null when logged out)
 *   token     — the Sanctum Bearer token (or null)
 *   login()   — calls POST /api/auth/login, stores result, updates state
 *   logout()  — calls POST /api/auth/logout, clears state
 *   loginWithBiometric() — prompts biometric, restores stored token
 *   isLoading — true during the initial session-restore check on mount
 *
 * Session persistence:
 *   Web    → sessionStorage (cleared when tab closes)
 *   Native → Capacitor Preferences (EncryptedSharedPreferences / Keychain)
 *            + biometric gating before token release
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import apiClient from '../api/client'
import { isNative } from '../utils/platform'
import {
  enrollBiometric,
  authenticateWithBiometric,
  clearBiometricEnrollment,
  isBiometricAvailable,
  isBiometricEnrolled,
} from '../services/biometricAuth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)  // checking stored session on mount

  // ── Restore session on first load ──────────────────────────────────────────
  // Web:    sessionStorage token → GET /api/auth/me to re-validate
  // Native: biometric prompt → stored Capacitor Preferences token → validate
  useEffect(() => {
    ;(async () => {
      try {
        // ── Native biometric auto-login attempt ────────────────────────────
        if (isNative) {
          const available = await isBiometricAvailable()
          const enrolled  = await isBiometricEnrolled()

          if (available && enrolled) {
            const result = await authenticateWithBiometric()

            if (result.success && result.token) {
              // Store in sessionStorage so the axios interceptor picks it up
              sessionStorage.setItem('crm_token', result.token)
              if (result.user) {
                sessionStorage.setItem('crm_user', JSON.stringify(result.user))
                setUser(result.user)
              }

              // Validate with server
              try {
                const { data } = await apiClient.get('/auth/me')
                setToken(result.token)
                setUser(data.user)
                sessionStorage.setItem('crm_user', JSON.stringify(data.user))
                // Re-enroll with fresh user data
                await enrollBiometric(result.token, data.user)
                return  // done — biometric login succeeded
              } catch {
                // Token expired on server — fall through to clear
                sessionStorage.removeItem('crm_token')
                sessionStorage.removeItem('crm_user')
                await clearBiometricEnrollment()
              }
            }
            // biometric failed or token invalid — fall through to normal check
          }
        }

        // ── Standard sessionStorage restore (web or native fallback) ───────
        const storedToken = sessionStorage.getItem('crm_token')
        const storedUser  = sessionStorage.getItem('crm_user')

        if (!storedToken) return

        // Optimistically restore from storage first so the UI doesn't flash
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)) } catch { /* ignore */ }
        }

        // Then validate with the server in the background
        try {
          const { data } = await apiClient.get('/auth/me')
          setToken(storedToken)
          setUser(data.user)
          sessionStorage.setItem('crm_user', JSON.stringify(data.user))
        } catch {
          // Token is invalid / expired — clear everything
          sessionStorage.removeItem('crm_token')
          sessionStorage.removeItem('crm_user')
          setToken(null)
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  // ── login() ────────────────────────────────────────────────────────────────
  /**
   * Standard password login.
   * On native: also enrolls biometric for future sessions.
   */
  const login = useCallback(async (email, password, role) => {
    // Initialize CSRF protection (only needed if using stateful Sanctum)
    if (window.location.hostname === 'localhost') {
      try {
        await apiClient.get('/../sanctum/csrf-cookie')
      } catch (e) {
        console.warn('CSRF initialization failed', e)
      }
    }
    const { data } = await apiClient.post('/auth/login', { email, password, role })

    sessionStorage.setItem('crm_token', data.token)
    sessionStorage.setItem('crm_user',  JSON.stringify(data.user))

    setToken(data.token)
    setUser(data.user)

    // Enroll biometric for next launch (non-blocking, fire-and-forget)
    if (isNative) {
      enrollBiometric(data.token, data.user).catch(() => {})
    }
  }, [])

  // ── loginWithBiometric() ───────────────────────────────────────────────────
  /**
   * Biometric-only login — prompts fingerprint / Face ID while on login page.
   * Returns { success, error } so the Login component can show feedback.
   */
  const loginWithBiometric = useCallback(async () => {
    const result = await authenticateWithBiometric()

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Store in sessionStorage for axios interceptor
    sessionStorage.setItem('crm_token', result.token)

    // Validate token with server
    try {
      const { data } = await apiClient.get('/auth/me')
      setToken(result.token)
      setUser(data.user)
      sessionStorage.setItem('crm_user', JSON.stringify(data.user))
      // Refresh stored user data
      await enrollBiometric(result.token, data.user)
      return { success: true }
    } catch {
      sessionStorage.removeItem('crm_token')
      await clearBiometricEnrollment()
      return { success: false, error: 'Session expired. Please login with password.' }
    }
  }, [])

  // ── logout() ───────────────────────────────────────────────────────────────
  /**
   * Revokes the current token server-side then clears local state.
   * On native: also wipes biometric credentials.
   */
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Swallow — we're logging out regardless
    } finally {
      sessionStorage.removeItem('crm_token')
      sessionStorage.removeItem('crm_user')
      setToken(null)
      setUser(null)

      // Wipe biometric credentials (non-blocking)
      if (isNative) {
        clearBiometricEnrollment().catch(() => {})
      }
    }
  }, [])

  const impersonate = useCallback(async (userId) => {
    const { data } = await apiClient.post('/auth/impersonate', { user_id: userId })
    sessionStorage.setItem('crm_token', data.token)
    sessionStorage.setItem('crm_user',  JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }, [])

  const value = { user, token, isLoading, login, loginWithBiometric, impersonate, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth() — convenience hook.
 *
 * Usage:
 *   const { user, login, loginWithBiometric, logout, isLoading } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
