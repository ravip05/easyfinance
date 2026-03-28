import React, { useState, useEffect, useRef } from 'react'
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'
import apiClient from '../api/client'

const isNative = Capacitor.isNativePlatform()

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', phone: '', password: '' })
  const [darkMode, setDarkMode] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [profilePic, setProfilePic] = useState(null)
  const [picUploading, setPicUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Dark mode colors
  const dm = darkMode
  const bg = dm ? '#0f172a' : '#f8fafc'
  const cardBg = dm ? '#1e293b' : 'white'
  const textPrimary = dm ? '#f1f5f9' : '#0f172a'
  const textSecondary = dm ? '#94a3b8' : '#64748b'
  const borderColor = dm ? '#334155' : '#e2e8f0'
  const inputBg = dm ? '#0f172a' : '#f8fafc'
  const rowBorder = dm ? '#1e293b' : '#f1f5f9'
  const iconCircleBg = dm ? '#1e293b' : '#f1f5f9'

  const s = {
    page: { minHeight: '100vh', background: bg, fontFamily: "'Inter', sans-serif", paddingBottom: 80, transition: 'background 0.3s' },
    inner: { maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' },
    heading: { fontSize: 30, fontWeight: 800, color: textPrimary, marginBottom: 4, letterSpacing: -0.5 },
    sub: { fontSize: 15, color: textSecondary, marginBottom: 40 },
    card: { background: cardBg, borderRadius: 20, border: `1px solid ${borderColor}`, boxShadow: dm ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)', padding: '28px 32px', marginBottom: 20, transition: 'background 0.3s' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${borderColor}` },
    iconBox: (gradient) => ({ width: 48, height: 48, borderRadius: 14, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    cardTitle: { fontSize: 17, fontWeight: 700, color: textPrimary, marginBottom: 2 },
    cardDesc: { fontSize: 13, color: textSecondary },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    fullCol: { gridColumn: '1 / -1' },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: dm ? '#64748b' : '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 },
    input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: `1.5px solid ${borderColor}`, borderRadius: 12, fontSize: 15, color: textPrimary, background: inputBg, outline: 'none', transition: 'border-color 0.2s' },
    btn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
    footer: { display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${borderColor}`, paddingTop: 20, marginTop: 24 },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${rowBorder}` },
    toggle: (on) => ({ position: 'relative', display: 'inline-block', width: 52, height: 28, borderRadius: 14, background: on ? '#2563eb' : (dm ? '#334155' : '#d1d5db'), transition: 'background 0.3s', cursor: 'pointer', flexShrink: 0 }),
    thumb: (on) => ({ position: 'absolute', top: 3, left: on ? 27 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.3s' }),
    alert: (type) => ({ padding: '14px 18px', borderRadius: 12, marginBottom: 20, fontSize: 14, fontWeight: 600, background: type === 'success' ? '#ecfdf5' : '#fef2f2', color: type === 'success' ? '#059669' : '#dc2626', border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}` }),
  }

  useEffect(() => { loadPreferences() }, [])

  const loadPreferences = async () => {
    try {
      const themePref = await Preferences.get({ key: 'darkMode' })
      const isDark = themePref.value === 'true'
      setDarkMode(isDark)
      if (isNative) {
        const bioPref = await Preferences.get({ key: 'biometric_enrolled' })
        setBiometricEnabled(bioPref.value === 'true')
      }
      const { data } = await apiClient.get('/api/user/settings')
      if (data?.user) setProfile(p => ({ ...p, name: data.user.name || '', phone: data.user.phone || '' }))
    } catch (err) { console.error(err) }
    // Load saved profile picture
    const saved = localStorage.getItem('profilePicture')
    if (saved) setProfilePic(saved)
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
    // Apply to root element for app-wide dark mode
    document.documentElement.style.colorScheme = v ? 'dark' : 'light'
    document.body.style.background = v ? '#0f172a' : ''
  }

  const toggleBiometric = async () => {
    const v = !biometricEnabled
    setBiometricEnabled(v)
    await Preferences.set({ key: 'biometric_enrolled', value: String(v) })
  }

  const handlePicChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: '✗ Image must be less than 2MB.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return
    }
    setPicUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setProfilePic(dataUrl)
      localStorage.setItem('profilePicture', dataUrl)
      setPicUploading(false)
      setMessage({ type: 'success', text: '✓ Profile picture updated! It will now appear on your ID Card.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
    reader.readAsDataURL(file)
  }

  const removePic = () => {
    setProfilePic(null)
    localStorage.removeItem('profilePicture')
    setMessage({ type: 'success', text: '✓ Profile picture removed.' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <h1 style={s.heading}>Settings</h1>
        <p style={s.sub}>Manage your account, security, and app preferences.</p>

        {message.text && <div style={s.alert(message.type)}>{message.text}</div>}

        {/* Profile Picture Card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.iconBox('linear-gradient(135deg, #0891b2, #0e7490)')}>
              <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <div style={s.cardTitle}>Profile Picture</div>
              <div style={s.cardDesc}>Upload a photo for your ID Card</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `3px solid #2563eb`, boxShadow: '0 4px 16px rgba(37,99,235,0.2)' }}
                />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 900, color: 'white',
                  border: `3px solid ${borderColor}`,
                }}>
                  {profile.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'EF'}
                </div>
              )}
              {picUploading && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}
            </div>

            {/* Upload actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePicChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {profilePic ? 'Change Photo' : 'Upload Photo'}
              </button>
              {profilePic && (
                <button
                  onClick={removePic}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: dm ? '#1e293b' : 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Remove Photo
                </button>
              )}
              <div style={{ fontSize: 12, color: textSecondary }}>JPG, PNG or GIF · Max 2MB<br />This photo will appear on your Employee ID Card.</div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
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
                  onBlur={e => e.target.style.borderColor = borderColor}
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
                  onBlur={e => e.target.style.borderColor = borderColor}
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
                  onBlur={e => e.target.style.borderColor = borderColor}
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
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: iconCircleBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {darkMode ? '🌙' : '☀️'}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>Dark Mode</div>
                  <div style={{ fontSize: 13, color: textSecondary }}>
                    {darkMode ? 'Dark theme is active' : 'Switch to dark theme'}
                  </div>
                </div>
              </div>
              <div
                style={s.toggle(darkMode)}
                onClick={e => { e.stopPropagation(); toggleDarkMode() }}
              >
                <div style={s.thumb(darkMode)} />
              </div>
            </div>

            {isNative && (
              <div
                style={{ ...s.row, borderBottom: 'none', cursor: 'pointer' }}
                onClick={toggleBiometric}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: iconCircleBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {biometricEnabled ? '🛡️' : '🔓'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>Biometric Login</div>
                    <div style={{ fontSize: 13, color: textSecondary }}>Use Face ID or Fingerprint to unlock</div>
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
