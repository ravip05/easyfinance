import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function IDCard() {
  const { user } = useAuth()
  const [showBack, setShowBack] = useState(false)

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'EF'

  const empId = `EF-${String(user?.id || 1).padStart(5, '0')}`

  // Load profile picture from localStorage (set via Settings page)
  const profilePic = localStorage.getItem('profilePicture') || null

  const roleColors = {
    admin: { bg: '#7c3aed', light: '#ede9fe', text: '#4c1d95' },
    manager: { bg: '#0369a1', light: '#e0f2fe', text: '#0c4a6e' },
    staff: { bg: '#065f46', light: '#d1fae5', text: '#064e3b' },
    dsa: { bg: '#9a3412', light: '#fff7ed', text: '#7c2d12' },
  }
  const roleColor = roleColors[user?.role?.toLowerCase()] || roleColors.staff

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: -0.5 }}>
          Employee ID Card
        </h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Click the card to view contact details</p>
      </div>

      {/* 3D Scene */}
      <div
        style={{ perspective: '1000px', cursor: 'pointer' }}
        onClick={() => setShowBack(b => !b)}
        data-idcard
      >
        <div style={{
          width: 320,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>

          {/* ===== FRONT ===== */}
          <div style={{
            width: 320,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}>
            {/* Header band — fixed height so avatar doesn't overlap text */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%)',
              padding: '20px 24px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', top: -10, right: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>
                    EASY<span style={{ color: '#60a5fa' }}>FINANCE</span>
                  </div>
                  <div style={{ color: 'rgba(148,163,184,1)', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', marginTop: 2 }}>
                    EMPLOYEE IDENTITY
                  </div>
                </div>
                {/* Shield badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(147,197,253,1)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
              </div>
            </div>

            {/* Accent strip below header */}
            <div style={{ height: 6, background: `linear-gradient(90deg, ${roleColor.bg}, ${roleColor.bg}99)` }} />

            {/* White body — avatar sits INSIDE the white area, not overlapping header */}
            <div style={{ background: 'white', padding: '24px 24px 24px' }}>

              {/* Avatar — centered, no negative margin */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      style={{
                        width: 80, height: 80,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `3px solid ${roleColor.bg}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 80, height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${roleColor.bg} 0%, ${roleColor.bg}cc 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, fontWeight: 900, color: 'white',
                      border: `3px solid ${roleColor.bg}30`,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}>
                      {initials}
                    </div>
                  )}
                  {/* Online dot */}
                  <div style={{
                    position: 'absolute', bottom: 4, right: 4,
                    width: 14, height: 14, borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid white',
                  }} />
                </div>
              </div>

              {/* Name & Role */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: -0.3 }}>
                  {user?.name || 'Admin User'}
                </h2>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  borderRadius: 20,
                  background: roleColor.light,
                  color: roleColor.text,
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: `1px solid ${roleColor.bg}30`,
                }}>
                  {user?.role || 'Employee'}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', marginBottom: 16 }} />

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Employee ID</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{empId}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Department</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {user?.role === 'admin' ? 'Administration' :
                     user?.role === 'manager' ? 'Operations' :
                     user?.role === 'dsa' ? 'Sales' : 'Support'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Access Level</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {user?.role === 'admin' ? 'Level 5 — Super' :
                     user?.role === 'manager' ? 'Level 4 — High' :
                     user?.role === 'dsa' ? 'Level 2 — Field' : 'Level 3 — Standard'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', marginBottom: 16 }} />

              {/* QR Code row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${empId}&color=0f172a`}
                  alt="QR"
                  style={{ width: 58, height: 58, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Issued by</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>EasyFinance CRM</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>easyfinancewale.in</div>
                </div>
              </div>
            </div>

            {/* Footer stripe */}
            <div style={{
              background: 'linear-gradient(90deg, #0f172a, #1e3a8a)',
              padding: '8px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} style={{ width: 3, height: i % 3 === 0 ? 10 : i % 2 === 0 ? 14 : 8, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
                ))}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.8)', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                {empId}
              </div>
            </div>
          </div>

          {/* ===== BACK ===== */}
          <div style={{
            width: 320,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            position: 'absolute',
            top: 0, left: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}>
            {/* Dark top */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', height: 56 }} />
            {/* Magnetic stripe */}
            <div style={{ background: '#0f172a', height: 40 }} />
            {/* White body */}
            <div style={{ background: 'white', padding: '20px 24px 24px' }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Contact Information</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <svg width="16" height="16" fill="none" stroke="#64748b" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Email</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{user?.email || 'admin@easyfinance.com'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <svg width="16" height="16" fill="none" stroke="#64748b" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Phone</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{user?.phone || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: '12px 14px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>⚠ Confidential</div>
                <div style={{ fontSize: 11, color: '#7f1d1d', lineHeight: 1.5 }}>
                  This card is property of EasyFinance. If found, please return to HR Department.
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Valid ID: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{empId}</strong></div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20,
                  background: '#dcfce7', color: '#15803d',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                }}>● ACTIVE</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: 'linear-gradient(90deg, #0f172a, #1e3a8a)', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 13 }}>EASY<span style={{ color: '#60a5fa' }}>FINANCE</span></div>
              <div style={{ color: 'rgba(148,163,184,0.8)', fontSize: 9, letterSpacing: '0.15em' }}>easyfinancewale.in</div>
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print ID Card
        </button>
        <button
          onClick={() => {
            // Download as image using canvas
            const card = document.querySelector('[data-idcard]')
            if (!card) return
            import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js')
              .then(mod => mod.default(card, { scale: 2, backgroundColor: null, useCORS: true }))
              .then(canvas => {
                const link = document.createElement('a')
                link.download = `IDCard_${empId}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()
              })
              .catch(() => {
                // Fallback: use window.print
                window.print()
              })
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
        >
          📥 Download as Image
        </button>
        <button
          onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); alert('Link copied!') } catch(e) {} }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #1e40af, #4f46e5)', border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,64,175,0.3)' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Share Card
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body > * { display: none; }
          .id-card-print { display: block !important; }
        }
      `}} />
    </div>
  )
}
