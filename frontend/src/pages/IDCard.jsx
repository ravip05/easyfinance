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
    <div id="page-idcard" className="page active">
      <div className="card-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="card-title">📇 My Visiting Card</h2>
          <p className="card-sub">Share your professional profile with clients</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            Print
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleShare}>
            Share
          </button>
        </div>
      </div>

      <div className="id-card-wrap">
        <div 
          className={`id-card ${isFlipped ? 'flipped' : ''}`} 
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Side */}
          <div className="id-card-front">
            <div className="id-card-glass" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="id-card-logo">EasyFinance <span>CRM</span></div>
              <div className="id-card-chip" />
            </div>
            <div style={{ marginTop: 'auto' }}>
              <div className="id-card-name">{user?.name}</div>
              <div className="id-card-role">{user?.role?.toUpperCase()}</div>
            </div>
          </div>

          {/* Back Side */}
          <div className="id-card-back">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="id-card-qr">
                {/* Mock QR Code */}
                <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  📱
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                Scan to save contact
              </div>
            </div>
            
            <div style={{ fontSize: 12 }}>
              <div style={{ marginBottom: 6 }}>📧 {user?.email}</div>
              <div style={{ marginBottom: 6 }}>📞 {user?.phone || '+91 91234 56789'}</div>
              <div>📍 Mumbai, Maharashtra, India</div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>VERIFIED PARTNER</span>
              <img src="/favicon.svg" alt="logo" style={{ width: 20, height: 20 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="empty" style={{ marginTop: 24 }}>
        <p className="empty-text">Tap the card to flip between front and back views.</p>
      </div>
    </div>
  )
}
