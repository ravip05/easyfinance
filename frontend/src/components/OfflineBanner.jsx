/**
 * components/OfflineBanner.jsx
 *
 * shows a slim banner when the app is offline
 * auto-dismisses when connection is restored
 */
import { useNetwork } from '../hooks/useNetwork'

export default function OfflineBanner() {
  const { isOnline } = useNetwork()

  if (isOnline) return null

  return (
    <div className="offline-banner" id="offline-banner" role="status" aria-live="polite">
      <span className="offline-banner-icon">📡</span>
      <span className="offline-banner-text">You are offline — changes will sync when reconnected</span>
    </div>
  )
}
