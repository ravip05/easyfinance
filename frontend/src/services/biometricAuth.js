/**
 * services/biometricAuth.js
 *
 * biometric authentication service for native platforms
 * fingerprint / face id login after initial password auth
 * stores auth token securely in capacitor preferences
 */
import { isNative } from '../utils/platform'

/**
 * check if biometric authentication is available on the device
 */
export async function isBiometricAvailable() {
  if (!isNative) return false
  try {
    const { BiometricAuth } = await import('@capacitor-community/biometric-auth')
    const result = await BiometricAuth.isAvailable()
    return result.has
  } catch {
    return false
  }
}

/**
 * enroll biometric auth — save auth token to secure storage
 * call this after a successful password login
 */
export async function enrollBiometric(token, userId) {
  if (!isNative) return
  try {
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.set({ key: 'auth_token', value: token })
    await Preferences.set({ key: 'auth_user_id', value: String(userId) })
    await Preferences.set({ key: 'biometric_enrolled', value: 'true' })
    console.log('biometric enrollment complete')
  } catch (e) {
    console.error('biometric enrollment failed:', e)
  }
}

/**
 * check if biometric has been previously enrolled
 */
export async function isBiometricEnrolled() {
  if (!isNative) return false
  try {
    const { Preferences } = await import('@capacitor/preferences')
    const { value } = await Preferences.get({ key: 'biometric_enrolled' })
    return value === 'true'
  } catch {
    return false
  }
}

/**
 * attempt biometric authentication
 * returns { success: true, token } or { success: false, error }
 */
export async function authenticateWithBiometric() {
  try {
    const { BiometricAuth } = await import('@capacitor-community/biometric-auth')

    await BiometricAuth.authenticate({
      reason: 'Unlock EasyFinance CRM',
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or Face ID',
      negativeButtonText: 'Use Password',
      allowDeviceCredential: true,
    })

    // biometric passed, retrieve stored token
    const { Preferences } = await import('@capacitor/preferences')
    const { value: token } = await Preferences.get({ key: 'auth_token' })

    if (!token) {
      return { success: false, error: 'no stored token' }
    }

    return { success: true, token }
  } catch (e) {
    return { success: false, error: e.message || 'biometric auth failed' }
  }
}

/**
 * clear biometric enrollment (on logout)
 */
export async function clearBiometricEnrollment() {
  if (!isNative) return
  try {
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.remove({ key: 'auth_token' })
    await Preferences.remove({ key: 'auth_user_id' })
    await Preferences.remove({ key: 'biometric_enrolled' })
  } catch {
    // silent
  }
}
