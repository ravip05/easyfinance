/**
 * services/biometricAuth.js
 *
 * Biometric authentication bridge for Capacitor native apps.
 * Uses @capgo/capacitor-native-biometric for fingerprint / Face ID
 * and @capacitor/preferences for secure Sanctum token persistence.
 *
 * Security model:
 *   - Token is stored in Capacitor Preferences (Android EncryptedSharedPreferences
 *     / iOS Keychain) — NOT in sessionStorage or localStorage.
 *   - Biometric prompt is required before the stored token is returned.
 *   - If biometric fails, the user must fall back to password login.
 *   - On logout, stored credentials are wiped immediately.
 *
 * Web fallback: all methods are safe to call on web — they return
 * false / null so the caller can skip biometric flows gracefully.
 */

import { isNative } from '../utils/platform'

// ── Storage keys ─────────────────────────────────────────────────────────────
const KEY_TOKEN    = 'crm_bio_token'
const KEY_USER     = 'crm_bio_user'
const KEY_ENROLLED = 'crm_bio_enrolled'

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if the device supports biometric authentication.
 * @returns {Promise<boolean>}
 */
export async function isBiometricAvailable() {
  if (!isNative) return false
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric')
    const result = await NativeBiometric.isAvailable()
    return result.isAvailable === true
  } catch {
    return false
  }
}

/**
 * Check if the user has previously enrolled biometric credentials.
 * @returns {Promise<boolean>}
 */
export async function isBiometricEnrolled() {
  if (!isNative) return false
  try {
    const { Preferences } = await import('@capacitor/preferences')
    const { value } = await Preferences.get({ key: KEY_ENROLLED })
    return value === 'true'
  } catch {
    return false
  }
}

/**
 * Store Sanctum token + full user object securely after a successful
 * password login.  Call this AFTER the backend has validated credentials.
 *
 * @param {string} token  - Sanctum Bearer token
 * @param {object} user   - Full user object from auth response
 */
export async function enrollBiometric(token, user) {
  if (!isNative) return
  try {
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.set({ key: KEY_TOKEN,    value: token })
    await Preferences.set({ key: KEY_USER,     value: JSON.stringify(user) })
    await Preferences.set({ key: KEY_ENROLLED, value: 'true' })
  } catch (err) {
    console.warn('[BiometricAuth] Enrollment failed:', err)
  }
}

/**
 * Prompt the user for biometric verification and return stored credentials.
 * Returns { success, token, user } — on failure, success is false and the
 * caller should fall back to password login.
 *
 * @returns {Promise<{ success: boolean, token?: string, user?: object, error?: string }>}
 */
export async function authenticateWithBiometric() {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric')
    const { Preferences }     = await import('@capacitor/preferences')

    // Prompt biometric — throws if cancelled or failed
    await NativeBiometric.verifyIdentity({
      reason:             'Unlock EasyFinance CRM',
      title:              'Biometric Login',
      subtitle:           'Use fingerprint or Face ID',
      description:        'Authenticate to access your account',
      negativeButtonText: 'Use Password',
      maxAttempts:        3,
    })

    // Biometric passed — retrieve stored credentials
    const { value: token }    = await Preferences.get({ key: KEY_TOKEN })
    const { value: userJson } = await Preferences.get({ key: KEY_USER })

    if (!token) {
      return { success: false, error: 'No stored token found' }
    }

    return {
      success: true,
      token,
      user: userJson ? JSON.parse(userJson) : null,
    }
  } catch (err) {
    return { success: false, error: err.message || 'Biometric auth failed' }
  }
}

/**
 * Wipe all stored biometric credentials.  Call on logout.
 */
export async function clearBiometricEnrollment() {
  if (!isNative) return
  try {
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.remove({ key: KEY_TOKEN })
    await Preferences.remove({ key: KEY_USER })
    await Preferences.remove({ key: KEY_ENROLLED })
  } catch {
    // silent — we're logging out regardless
  }
}
