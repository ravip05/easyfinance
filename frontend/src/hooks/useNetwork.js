/**
 * hooks/useNetwork.js
 *
 * online/offline detection hook
 * uses capacitor network plugin on native, navigator.onLine on web
 */
import { useEffect, useState } from 'react'
import { isNative } from '../utils/platform'

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    if (isNative) {
      // capacitor network plugin (loaded dynamically)
      let cleanup = () => {}
      import('@capacitor/network').then(({ Network }) => {
        const handler = Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected)
        })
        cleanup = () => handler.then(h => h.remove())
      }).catch(() => {
        // plugin not installed, fall through to web listeners
      })
      return () => cleanup()
    }

    // web fallback
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return { isOnline }
}
