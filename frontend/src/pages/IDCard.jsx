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
        toast('info', 'Link copied to clipboard')
      }
    } catch (err) {
      console.error('Share failed', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header className="page-header w-100 mb-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.03), rgba(59,130,246,0.05))', padding: '32px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.7)' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #0f172a, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          Digital Business Card
        </h1>
        <p className="text-muted mt-2 mb-4" style={{ fontSize: '1.1rem' }}>Present your professional identity with a single tap.</p>
        
        <div className="d-flex justify-content-center gap-3">
          <button className="btn px-4 py-2" onClick={handlePrint} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, color: '#475569', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
            🖨️ Print Card
          </button>
          <button className="btn px-4 py-2" onClick={handleShare} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '12px', fontWeight: 600, color: 'white', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            🔗 Share Profile
          </button>
        </div>
      </header>

      {/* 3D Card Container */}
      <div 
        style={{ 
          perspective: '1000px', 
          width: '100%', 
          maxWidth: '400px',
          height: '600px',
          cursor: 'pointer',
          position: 'relative',
          margin: '0 auto'
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT SIDE */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
              borderRadius: '24px',
              padding: '32px',
              color: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Glassmorphic decorative elements */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
            
            <div className="d-flex justify-content-between align-items-center mb-5 position-relative z-1">
              <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EasyFinance <span style={{ color: '#3b82f6', WebkitTextFillColor: '#3b82f6' }}>CRM</span>
              </div>
              <div style={{ width: '40px', height: '30px', background: 'linear-gradient(135deg, #eab308, #ca8a04)', borderRadius: '6px', opacity: 0.9, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '-10%', width: '120%', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', left: '50%', top: '-10%', height: '120%', width: '1px', background: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center position-relative z-1">
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)', 
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', marginBottom: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                {user?.initials ?? user?.name?.slice(0, 2).toUpperCase() ?? '👤'}
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{user?.name || 'Authorized Personnel'}</h2>
              <p style={{ 
                color: '#60a5fa', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '2px', 
                textTransform: 'uppercase', marginTop: '8px',
                background: 'rgba(59,130,246,0.1)', padding: '4px 16px', borderRadius: '20px'
              }}>
                {user?.role || 'Staff'}
              </p>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              color: '#0f172a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(0,0,0,0.05)',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="text-center mb-5">
              <div style={{ 
                width: '160px', height: '160px', margin: '0 auto', 
                background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ fontSize: '4rem' }}>📱</div>
                <div style={{ position: 'absolute', bottom: '-30px', background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' }}>
                  Scan to connect
                </div>
              </div>
            </div>
            
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <div className="d-flex align-items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <span style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '10px', borderRadius: '10px', fontSize: '1.2rem', display: 'flex' }}>📧</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email Address</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email || 'contact@easyfinance.com'}</div>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <span style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '10px', fontSize: '1.2rem', display: 'flex' }}>📞</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Phone Number</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{user?.phone || '+91 98765 43210'}</div>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px', fontSize: '1.2rem', display: 'flex' }}>📍</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Office Location</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Mumbai, India</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '2px dashed #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '1px' }}>VERIFIED PARTNER</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#e2e8f0' }}>CRM</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted mt-5 text-center" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ animation: 'bounce 2s infinite' }}>👆</span> Tap the card to flip between front and back views
      </p>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
      `}} />
    </div>
  )
}
