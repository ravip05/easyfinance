import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function IDCard() {
  const { user } = useAuth()
  const [showBack, setShowBack] = useState(false)
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  
  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'EF'

  const empId = `EF-${String(user?.id || 1).padStart(5, '0')}`
  const profilePic = localStorage.getItem('profilePicture') || null

  // Role Themes
  const theme = isAdmin ? {
    primary: '#0f172a',
    secondary: '#8b5cf6', // Purple/Gold accent
    accent: '#fbbf24',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    text: 'white',
    badge: 'SUPERUSER',
    icon: '👑'
  } : {
    primary: '#1e40af',
    secondary: '#60a5fa',
    accent: '#3b82f6',
    bg: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    text: '#0f172a',
    badge: 'OFFICIAL STAFF',
    icon: '👤'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.04em' }}>
          Digital Identity Vault
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Your secure system credentials and access token.</p>
      </div>

      {/* Card Wrapper (3D Effect) */}
      <div 
        style={{ perspective: '1200px', cursor: 'pointer' }}
        onClick={() => setShowBack(!showBack)}
      >
        <div style={{
          width: '340px',
          height: '520px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          
          {/* FRONT SIDE */}
          <div data-card-front style={{
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
            background: isAdmin ? theme.primary : 'white',
            borderRadius: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            border: isAdmin ? `2px solid ${theme.secondary}40` : '1.5px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Holographic Overlay (Only for Admin) */}
            {isAdmin && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)', backgroundSize: '200% 200%', animation: 'hologram 4s linear infinite', zIndex: 1, pointerEvents: 'none' }} />}
            
            {/* Header */}
            <div style={{ padding: '32px', background: isAdmin ? 'transparent' : 'rgba(30,64,175,0.03)', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: isAdmin ? 'white' : '#1e40af', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.02em' }}>
                        EASY<span style={{ color: isAdmin ? theme.secondary : '#3b82f6' }}>FINANCE</span>
                    </div>
                    <div style={{ fontSize: '22px' }}>{theme.icon}</div>
                </div>
                <div style={{ marginTop: '4px', fontSize: '10px', fontWeight: 800, color: isAdmin ? '#94a3b8' : '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {theme.badge}
                </div>
            </div>

            {/* Avatar Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 32px 32px', zIndex: 2 }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <div style={{ 
                        width: '120px', height: '120px', borderRadius: '40px', 
                        background: isAdmin ? 'linear-gradient(45deg, #1e293b, #334155)' : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '42px', fontWeight: 900, color: isAdmin ? 'white' : '#1e40af',
                        border: isAdmin ? `3px solid ${theme.secondary}` : `3px solid ${theme.primary}`,
                        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        {profilePic ? <img src={profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="P" /> : initials}
                    </div>
                    <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '32px', height: '32px', background: '#22c55e', borderRadius: '12px', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✓</div>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 900, color: isAdmin ? 'white' : '#0f172a', margin: '0 0 8px 0', textAlign: 'center' }}>{user?.name}</h2>
                <div style={{ 
                    padding: '6px 16px', borderRadius: '12px', background: isAdmin ? `${theme.secondary}20` : '#eff6ff', 
                    color: isAdmin ? theme.secondary : '#1e40af', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' 
                }}>
                    {user?.role?.toUpperCase()}
                </div>

                {/* Details Grid */}
                <div style={{ width: '100%', marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <DetailItem label="Staff ID" value={empId} isAdmin={isAdmin} />
                    <DetailItem label="Department" value={isAdmin ? 'Executive' : 'Operations'} isAdmin={isAdmin} />
                    <DetailItem label="Access Level" value={isAdmin ? 'L5 - Super' : 'L3 - Standard'} isAdmin={isAdmin} />
                    <DetailItem label="Status" value="Verified" isAdmin={isAdmin} />
                </div>
            </div>

            {/* Footer QR */}
            <div style={{ padding: '32px', borderTop: isAdmin ? `1px solid rgba(255,255,255,0.05)` : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${empId}&color=${isAdmin ? 'ffffff' : '0f172a'}&bgcolor=${isAdmin ? '0f172a' : 'ffffff'}`} style={{ width: '50px', height: '50px', borderRadius: '8px', opacity: 0.8 }} alt="QR" />
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>VERIFIED BY</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: isAdmin ? 'white' : '#0f172a' }}>EasyFinance CRM</div>
                </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
            background: 'white', borderRadius: '28px',
            transform: 'rotateY(180deg)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
             <div style={{ padding: '40px 32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '32px', color: '#64748b' }}>SECURITY POLICY</h3>
                <p style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.6, marginBottom: '40px' }}>
                    This digital credential is the sole property of EasyFinance. Unauthorized duplication or distribution is prohibited. 
                    If found, please contact the IT administration immediately.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <BackInfo label="Support Link" val="help.easyfinance.in" />
                    <BackInfo label="Policy Ver" val="v4.2.0-Production" />
                </div>
                <div style={{ marginTop: '60px', padding: '24px', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>DIGITAL SIGNATURE</div>
                     <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '26px', color: '#1e40af' }}>{user?.name}</div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Download as Image */}
        <button onClick={async () => {
          const card = document.querySelector('[data-card-front]')
          if (!card) return
          try {
            const canvas = document.createElement('canvas')
            const scale = 2
            canvas.width = card.offsetWidth * scale
            canvas.height = card.offsetHeight * scale
            const ctx = canvas.getContext('2d')
            ctx.scale(scale, scale)
            // Use html-to-canvas fallback: paint a solid bg + text
            ctx.fillStyle = isAdmin ? '#0f172a' : '#ffffff'
            ctx.fillRect(0, 0, card.offsetWidth, card.offsetHeight)
            ctx.font = '800 20px Inter, sans-serif'
            ctx.fillStyle = isAdmin ? '#ffffff' : '#1e40af'
            ctx.fillText('EASYFINANCE', 32, 50)
            ctx.font = '800 24px Inter, sans-serif'
            ctx.fillStyle = isAdmin ? '#ffffff' : '#0f172a'
            ctx.fillText(user?.name || '', 70, 200)
            ctx.font = '700 12px Inter, sans-serif'
            ctx.fillStyle = '#64748b'
            ctx.fillText(`ID: ${empId}`, 70, 225)
            ctx.fillText(`Role: ${user?.role?.toUpperCase()}`, 180, 225)
            ctx.fillText('EasyFinance CRM', 70, 250)
            const link = document.createElement('a')
            link.download = `EasyFinance_ID_${empId}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
          } catch(e) { alert('Download failed. Try Print instead.') }
        }} style={{
          padding: '12px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white',
          fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s'
        }}>📥 Download Card</button>

        {/* Share vCard */}
        <button onClick={() => {
          const vcf = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${user?.name || 'Employee'}`,
            `TEL;TYPE=CELL:${user?.phone || ''}`,
            `EMAIL:${user?.email || ''}`,
            `TITLE:${user?.role?.toUpperCase() || 'STAFF'}`,
            `ORG:EasyFinance`,
            `NOTE:Employee ID: ${empId}`,
            'END:VCARD'
          ].join('\n')
          const blob = new Blob([vcf], { type: 'text/vcard' })
          const url = URL.createObjectURL(blob)
          if (navigator.share) {
            navigator.share({
              title: `${user?.name} - EasyFinance`,
              text: `Contact card for ${user?.name}`,
              files: [new File([blob], `${user?.name}_EasyFinance.vcf`, { type: 'text/vcard' })]
            }).catch(() => {
              const a = document.createElement('a'); a.href = url; a.download = `${user?.name}_EasyFinance.vcf`; a.click()
            })
          } else {
            const a = document.createElement('a'); a.href = url; a.download = `${user?.name}_EasyFinance.vcf`; a.click()
          }
        }} style={{
          padding: '12px 24px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white',
          fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all 0.2s'
        }}>📤 Share Contact</button>

        {/* Print */}
        <button onClick={() => window.print()} style={{
          padding: '12px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white',
          fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>🖨 Print Card</button>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 16, fontWeight: 600 }}>
        Tap card to flip • Share contact via vCard
      </p>

      <style>{`
        @keyframes hologram {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @media print {
          body * { visibility: hidden; }
          [data-card-front], [data-card-front] * { visibility: visible; }
          [data-card-front] { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  )
}

function DetailItem({ label, value, isAdmin }) {
    return (
        <div>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isAdmin ? 'white' : '#0f172a' }}>{value}</div>
        </div>
    )
}

function BackInfo({ label, val }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>{label}</span>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a' }}>{val}</span>
        </div>
    )
}
