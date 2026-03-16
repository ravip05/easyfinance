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
 *   isLoading — true during the initial session-restore check on mount
 *
 * Session persistence: token + user are stored in sessionStorage so they
 * survive page refreshes within the same browser tab, but are cleared when
 * the tab is closed (matching the original prototype's behaviour).
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import apiClient from '../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)  // checking stored session on mount

  // ── Restore session on first load ──────────────────────────────────────────
  // If sessionStorage has a token, hit GET /api/auth/me to re-validate it and
  // get a fresh user payload (role, team members, etc. may have changed).
  useEffect(() => {
    const storedToken = sessionStorage.getItem('crm_token')
    const storedUser  = sessionStorage.getItem('crm_user')

    if (!storedToken) {
      setIsLoading(false)
      return
    }

    // Optimistically restore from storage first so the UI doesn't flash
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch { /* ignore */ }
    }

    // Then validate with the server in the background
    apiClient
      .get('/auth/me')
      .then(({ data }) => {
        setToken(storedToken)
        setUser(data.user)
        sessionStorage.setItem('crm_user', JSON.stringify(data.user))
      })
      .catch(() => {
        // Token is invalid / expired — clear everything
        sessionStorage.removeItem('crm_token')
        sessionStorage.removeItem('crm_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ── login() ────────────────────────────────────────────────────────────────
  /**
   * Calls POST /api/auth/login with { email, password }.
   * Throws the raw axios error on failure so the Login component can
   * display the server's validation message directly.
   *
   * @returns {Promise<void>}
   */
  const login = useCallback(async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password })

    sessionStorage.setItem('crm_token', data.token)
    sessionStorage.setItem('crm_user',  JSON.stringify(data.user))

    setToken(data.token)
    setUser(data.user)
  }, [])

  // ── logout() ───────────────────────────────────────────────────────────────
  /**
   * Revokes the current token server-side then clears local state.
   * Fire-and-forget: we clear state immediately even if the request fails
   * (e.g. when offline) to always get the user back to the login screen.
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
    }
  }, [])

  const value = { user, token, isLoading, login, logout }

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
 *   const { user, login, logout, isLoading } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
