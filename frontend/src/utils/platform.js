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

import { Capacitor } from '@capacitor/core'

const _platform = Capacitor.getPlatform()
const _isNative = Capacitor.isNativePlatform()

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
