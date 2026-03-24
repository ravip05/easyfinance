import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { useToast } from '../context/ToastContext'

export default function IDCard() {
  const { user } = useAuth()
  const toast = useToast()
  const [isFlipped, setIsFlipped] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: `${user?.name}'s Visiting Card`,
      text: `Connect with ${user?.name} (${user?.role}) at EasyFinance CRM.`,
      url: window.location.href,
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share(shareData)
      } else if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast?.('info', 'Link copied to clipboard')
      }
    } catch (err) {
      console.error('Share failed', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div id="page-idcard" className="page active" style={{ paddingBottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Digital Identity</h1>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>Tap the card to view details. Share with clients to establish trust.</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={handlePrint}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={handleShare}>🔗 Share Card</button>
        </div>
      </div>

      {/* 3D Card Container */}
      <div 
        style={{
          perspective: 1200,
          width: '100%',
          maxWidth: 380,
          aspectRatio: '0.64', // Traditional ID card ratio (approx 2.125 x 3.375)
          cursor: 'pointer',
          position: 'relative',
          margin: '0 auto'
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          style={{
            width: '100%', height: '100%', position: 'relative',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT SIDE */}
          <div 
            style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              background: '#0f172a', // Deep slate/navy
              borderRadius: 24, padding: 32, color: 'white',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Subtle light leak effects */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 16, color: '#f8fafc', letterSpacing: '0.5px' }}>
                EasyFinance <span style={{ color: '#3b82f6' }}>CRM</span>
              </div>
              <div style={{ width: 44, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #fbbf24, #d97706)', isolation: 'isolate', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '10%', right: '10%', top: '40%', height: '1px', background: 'rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: 20, 
                background: 'linear-gradient(135deg, #1e293b, #334155)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#f8fafc',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
              }}>
                {user?.initials || user?.name?.slice(0, 2).toUpperCase() || 'AU'}
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6, lineHeight: 1.1 }}>
                {user?.name || 'Authorized User'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                {user?.role || 'Staff Member'}
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
              <div style={{ opacity: 0.5, fontSize: 10, letterSpacing: '1.5px', fontFamily: 'monospace' }}>
                ID: {user?.id?.toString().padStart(6, '0') || '000000'}
              </div>
              <div style={{ width: 44, height: 44, background: 'white', padding: 4, borderRadius: 8 }}>
                {/* Micro QR Placeholder */}
                <div style={{ width: '100%', height: '100%', background: 'url(https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=EasyFinance) center/cover' }} />
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              background: '#ffffff',
              borderRadius: 24, padding: 32, color: '#1e293b',
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
              transform: 'rotateY(180deg)',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ marginBottom: 40, marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 24 }}>
                Contact Information
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Email Address</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.email || 'contact@easyfinance.com'}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Phone Number</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {user?.phone || '+91 90000 00001'}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Office Location</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    Mumbai, India
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 16, background: 'var(--green)', borderRadius: '50%', border: '3px solid var(--green-light)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.5px' }}>VERIFIED PARTNER</span>
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 900, color: 'var(--border2)' }}>CRM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
