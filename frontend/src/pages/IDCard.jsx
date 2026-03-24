import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function IDCard() {
  const { user } = useAuth()
  const cardRef = useRef(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isFlipped, setIsFlipped] = useState(false)
  const [glareOpacity, setGlareOpacity] = useState(0)

  const handleMouseMove = (e) => {
    if (!cardRef.current || isFlipped) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    setRotate({ x: ((y - cy) / cy) * -12, y: ((x - cx) / cx) * 12 })
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
    setGlareOpacity(0.6)
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setGlareOpacity(0)
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'EF'
  const credentialId = `${String(user?.id || 1).padStart(4, '0')}-${Math.floor(1000 + (user?.id || 1) * 1234.56) % 9000 + 1000}-CRM`

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, paddingBottom: 48, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #1e3a8a, #4338ca)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
          Digital Credential
        </h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Hover to interact • Click to flip</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
          <button
            onClick={async () => { try { await navigator.clipboard.writeText(window.location.href) } catch(e) {} }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
        </div>
      </div>

      {/* Card Scene */}
      <div style={{ perspective: '1200px', width: 380, height: 240, cursor: 'pointer' }} onClick={() => { setIsFlipped(!isFlipped); setRotate({ x: 0, y: 0 }) }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          }}
        >
          {/* FRONT */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 10px 20px rgba(99,102,241,0.15)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', padding: '24px 28px',
          }}>
            {/* Dot grid pattern */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
            {/* Glow blob */}
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 200, height: 200, background: 'rgba(99,102,241,0.25)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
            {/* Glare */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, opacity: glareOpacity, background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.25) 0%, transparent 60%)`, pointerEvents: 'none', transition: 'opacity 0.2s', mixBlendMode: 'overlay' }} />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 16, letterSpacing: -0.5 }}>
                  EASY<span style={{ color: '#60a5fa' }}>FINANCE</span>
                </div>
                <div style={{ color: '#6366f1', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', marginTop: 2 }}>GLOBAL CRM</div>
              </div>
              {/* Gold chip */}
              <div style={{ width: 44, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #fde68a, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.4)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 4, borderRadius: 3, border: '1px solid rgba(0,0,0,0.15)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.12)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '30%', width: 1, background: 'rgba(0,0,0,0.12)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, right: '30%', width: 1, background: 'rgba(0,0,0,0.12)' }} />
              </div>
            </div>

            {/* User info */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>{user?.name || 'Admin User'}</div>
                <div style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 20, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {user?.role || 'Executive'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Credential ID</div>
                <div style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: 12, marginTop: 2 }}>{credentialId}</div>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>

          {/* BACK */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'white',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Black stripe */}
            <div style={{ height: 44, background: '#111827', flexShrink: 0, marginTop: 28 }} />

            <div style={{ flex: 1, padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: 8, marginBottom: 4 }}>Contact</div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginTop: 1, wordBreak: 'break-all' }}>{user?.email || 'admin@easyfinance.com'}</div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginTop: 1 }}>{user?.phone || '+91 98765 43210'}</div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=EF-${user?.id || 1}-CREDENTIAL`}
                  alt="QR"
                  style={{ width: 52, height: 52, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 14 }}>EASY<span style={{ color: '#2563eb' }}>FINANCE</span></div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.1em' }}>CONFIDENTIAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 28, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
        Click or tap the card to reveal contact details
      </p>
    </div>
  )
}
