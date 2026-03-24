import React, { useState, useEffect } from 'react'
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'
import apiClient from '../api/client'

const isNative = Capacitor.isNativePlatform()

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", paddingBottom: 80 },
  inner: { maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' },
  heading: { fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: '#64748b', marginBottom: 40 },
  card: { background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '28px 32px', marginBottom: 20 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' },
  iconBox: (gradient) => ({ width: 48, height: 48, borderRadius: 14, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  fullCol: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 15, color: '#0f172a', background: '#f8fafc', outline: 'none', transition: 'border-color 0.2s' },
  btn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  footer: { display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 20, marginTop: 24 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' },
  toggle: (on) => ({ position: 'relative', display: 'inline-block', width: 52, height: 28, borderRadius: 14, background: on ? '#2563eb' : '#d1d5db', transition: 'background 0.3s', cursor: 'pointer', flexShrink: 0 }),
  thumb: (on) => ({ position: 'absolute', top: 3, left: on ? 27 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.3s' }),
  alert: (type) => ({ padding: '14px 18px', borderRadius: 12, marginBottom: 20, fontSize: 14, fontWeight: 600, background: type === 'success' ? '#ecfdf5' : '#fef2f2', color: type === 'success' ? '#059669' : '#dc2626', border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}` }),
}

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', phone: '', password: '' })
  const [darkMode, setDarkMode] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { loadPreferences() }, [])

  const loadPreferences = async () => {
    try {
      const themePref = await Preferences.get({ key: 'darkMode' })
      setDarkMode(themePref.value === 'true')
      if (isNative) {
        const bioPref = await Preferences.get({ key: 'biometric_enrolled' })
        setBiometricEnabled(bioPref.value === 'true')
      }
      const { data } = await apiClient.get('/api/user/settings')
      if (data?.user) setProfile(p => ({ ...p, name: data.user.name || '', phone: data.user.phone || '' }))
    } catch (err) { console.error(err) }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const payload = { name: profile.name, phone: profile.phone }
      if (profile.password) payload.password = profile.password
      await apiClient.post('/api/settings/profile', payload)
      setMessage({ type: 'success', text: '✓ Profile updated successfully!' })
      setProfile(p => ({ ...p, password: '' }))
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch { setMessage({ type: 'error', text: '✗ Failed to update profile.' }) }
    finally { setLoading(false) }
  }

  const toggleDarkMode = async () => {
    const v = !darkMode
    setDarkMode(v)
    await Preferences.set({ key: 'darkMode', value: String(v) })
    document.documentElement.classList.toggle('dark', v)
  }

  const toggleBiometric = async () => {
    const v = !biometricEnabled
    setBiometricEnabled(v)
    await Preferences.set({ key: 'biometric_enrolled', value: String(v) })
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <h1 style={s.heading}>Settings</h1>
        <p style={s.sub}>Manage your account, security, and app preferences.</p>

        {message.text && <div style={s.alert(message.type)}>{message.text}</div>}

        {/* Profile Card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.iconBox('linear-gradient(135deg, #2563eb, #4f46e5)')}>
              <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <div style={s.cardTitle}>Profile Information</div>
              <div style={s.cardDesc}>Update your name, phone, and password</div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div style={s.grid}>
              <div>
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  required
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div>
                <label style={s.label}>Phone Number</label>
                <input
                  style={s.input}
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  required
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div style={s.fullCol}>
                <label style={s.label}>New Password <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep current)</span></label>
                <input
                  style={s.input}
                  type="password"
                  value={profile.password}
                  placeholder="Enter new password"
                  onChange={e => setProfile({ ...profile, password: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div style={s.footer}>
              <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences Card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.iconBox('linear-gradient(135deg, #7c3aed, #db2777)')}>
              <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <div style={s.cardTitle}>App Preferences</div>
              <div style={s.cardDesc}>Configure your experience</div>
            </div>
          </div>

          <div>
            <div
              style={{ ...s.row, cursor: 'pointer' }}
              onClick={toggleDarkMode}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {darkMode ? '🌙' : '☀️'}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Dark Mode</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Switch between light and dark theme</div>
                </div>
              </div>
              <div style={s.toggle(darkMode)} onClick={e => { e.stopPropagation(); toggleDarkMode() }}>
                <div style={s.thumb(darkMode)} />
              </div>
            </div>

            {isNative && (
              <div
                style={{ ...s.row, borderBottom: 'none', cursor: 'pointer' }}
                onClick={toggleBiometric}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {biometricEnabled ? '🛡️' : '🔓'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Biometric Login</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Use Face ID or Fingerprint to unlock</div>
                  </div>
                </div>
                <div style={s.toggle(biometricEnabled)} onClick={e => { e.stopPropagation(); toggleBiometric() }}>
                  <div style={s.thumb(biometricEnabled)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      `}</style>
    </div>
  )
}
