/**
 * pages/MyAttendance.jsx
 *
 * Geofenced daily attendance with web-safe geolocation.
 * Uses navigator.geolocation (works on all browsers) with a fallback
 * for Capacitor native when available.
 * Bridges to the real backend API: POST /attendance/check-in, POST /attendance/check-out.
 */
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'

// Office coordinates & geofence radius (should be fetched from settings)
const OFFICE_COORDS = { lat: 19.0760, lng: 72.8777 }
const ALLOWED_RADIUS_METERS = 200

/** Calculate distance between two coordinates in meters (Haversine) */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLon = (lon2 - lon1) * rad
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Get current position using web API (Capacitor-free) */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

export default function MyAttendance() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState(null)
  const [locationInfo, setLocationInfo] = useState(null)

  // Fetch today's attendance on mount
  useEffect(() => {
    fetchToday()
  }, [])

  const fetchToday = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/attendance/today')
      if (data?.data) {
        setAttendance(data.data)
      }
    } catch (err) {
      // No record for today — that's fine
      setAttendance(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (type) => {
    setActing(true)
    setError('')

    try {
      // 1. Get location
      const coords = await getCurrentPosition()
      setLocationInfo(coords)

      // 2. Geofence check (only for check-in)
      const distance = getDistance(coords.latitude, coords.longitude, OFFICE_COORDS.lat, OFFICE_COORDS.lng)

      if (distance > ALLOWED_RADIUS_METERS && type === 'check-in') {
        setError(`You are ${Math.round(distance)}m away from the office. Must be within ${ALLOWED_RADIUS_METERS}m.`)
        setActing(false)
        return
      }

      // 3. Send to backend API
      const endpoint = type === 'check-in' ? '/attendance/check-in' : '/attendance/check-out'
      const { data } = await apiClient.post(endpoint, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      })

      if (data?.data) {
        setAttendance(data.data)
      } else {
        // Update locally if backend doesn't return the record
        if (type === 'check-in') {
          setAttendance({ check_in_at: new Date().toISOString(), status: 'present' })
        } else {
          setAttendance(prev => ({ ...prev, check_out_at: new Date().toISOString() }))
        }
      }
    } catch (err) {
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access in your browser settings.')
      } else if (err.code === 2) {
        setError('Cannot determine your location. Please check GPS/network settings.')
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to process attendance.')
      }
    }

    setActing(false)
  }

  const formatTime = (isoStr) => {
    if (!isoStr) return '—'
    return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div id="page-myattendance" className="page active">
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
          My Attendance
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>
          Geofenced daily check-in · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--red-light)', border: '1px solid #fecaca',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 12, color: 'var(--red)', textAlign: 'left',
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, color: 'var(--text3)', fontSize: 13 }}>Loading attendance…</div>
        ) : !attendance ? (
          /* Not checked in */
          <>
            <div style={{
              background: 'var(--accent-light)', border: '1px solid #bfdbfe',
              borderRadius: 14, padding: 20, marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                ⏳ Not Checked In
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                You must be within {ALLOWED_RADIUS_METERS}m of the office to check in.
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}
              onClick={() => handleAction('check-in')}
              disabled={acting}
            >
              {acting ? '📡 Verifying Location…' : '✅ Tap to Check‑In'}
            </button>
          </>
        ) : (
          /* Checked in — show status */
          <>
            <div style={{
              background: 'var(--green-light)', border: '1px solid #a7f3d0',
              borderRadius: 14, padding: 20, marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>
                ✅ Checked In
              </div>
              <div className="grid-2" style={{ gap: 20, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Check-in</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    {formatTime(attendance.check_in_at)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>Check-out</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, marginTop: 4, color: attendance.check_out_at ? 'var(--text)' : 'var(--text3)' }}>
                    {attendance.check_out_at ? formatTime(attendance.check_out_at) : '—'}
                  </div>
                </div>
              </div>
            </div>

            {!attendance.check_out_at && (
              <button
                className="btn btn-danger"
                style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}
                onClick={() => handleAction('check-out')}
                disabled={acting}
              >
                {acting ? '📡 Verifying Location…' : '🚪 Punch Out'}
              </button>
            )}
          </>
        )}

        {/* Location debug info */}
        {locationInfo && (
          <div style={{ marginTop: 16, fontSize: 10, color: 'var(--text3)' }}>
            📍 {locationInfo.latitude.toFixed(4)}, {locationInfo.longitude.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  )
}
