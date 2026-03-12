/**
 * utils/platform.js
 *
 * capacitor platform detection utilities
 * provides feature flags for native-only capabilities
 *
 * usage:
 *   import { isNative, hasCamera } from '../utils/platform'
 *   if (hasCamera) { ... }
 */

let _platform = 'web'
let _isNative = false

try {
  // dynamic import so this module works even without capacitor installed
  const { Capacitor } = await import('@capacitor/core')
  _platform = Capacitor.getPlatform()
  _isNative = Capacitor.isNativePlatform()
} catch {
  // capacitor not installed yet, default to web
}

export const platform   = _platform
export const isNative   = _isNative
export const isAndroid  = _platform === 'android'
export const isIOS      = _platform === 'ios'
export const isWeb      = _platform === 'web'

// feature flags
export const hasCamera      = _isNative
export const hasBiometric   = _isNative
export const hasNativePush  = _isNative
export const hasNativeShare = _isNative
