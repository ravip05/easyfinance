import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { useToast } from '../context/ToastContext'

export default function IDCard() {
  const { user } = useAuth()
  const toast = useToast()
  
  // For the 3D tilt effect on hover
  const cardRef = useRef(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const [isFlipped, setIsFlipped] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current || isFlipped) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -15
    const rotateY = ((x - centerX) / centerX) * 15

    setRotate({ x: rotateX, y: rotateY })
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.8
    })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  const handleShare = async () => {
    const shareData = {
      title: `${user?.name}'s Digital Credential`,
      text: `Connect with ${user?.name} at EasyFinance CRM.`,
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      
      {/* Background Animated Orbs for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="text-center mb-12 relative z-10 w-full max-w-lg mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 mb-4 tracking-tight">
          Digital Credential
        </h1>
        <p className="text-slate-500 font-medium">Next-generation secure identity. Tap to flip, hover to interact.</p>
        
        <div className="flex gap-4 justify-center mt-8">
          <button 
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print
          </button>
          <button 
            onClick={handleShare}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Share
          </button>
        </div>
      </div>

      {/* 3D Scene */}
      <div 
        className="relative w-full max-w-[340px] aspect-[1/1.6] perspective-[2000px] z-20 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full relative preserve-3d transition-transform duration-700 ease-out"
          style={{
            transform: isFlipped 
              ? 'rotateY(180deg)' 
              : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
          }}
        >
          {/* ----- FRONT OF CARD ----- */}
          <div className="absolute inset-0 backface-hidden">
            {/* The Animated Border Glow */}
            <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br from-blue-500 via-transparent to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity blur-[2px]" />
            
            {/* Card Body */}
            <div className="absolute inset-0 bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col pt-8 pb-6 px-6 border border-slate-700/50">
              
              {/* Background Map / Mesh */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} 
              />
              
              {/* Vibrant Orb inside card */}
              <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[50%] bg-blue-600/30 rounded-full blur-[60px]" />
              <div className="absolute top-[40%] -left-[30%] w-[60%] h-[50%] bg-violet-600/20 rounded-full blur-[60px]" />

              {/* Dynamic Glare Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300 rounded-[2rem]"
                style={{
                  opacity: glare.opacity,
                  background: `radial-gradient(farthest-corner circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`
                }}
              />

              {/* Holographic Foil overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-color-dodge rounded-[2rem]"
                   style={{
                     background: 'linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(255,100,255,0.3) 50%, rgba(100,200,255,0.4) 60%, transparent 80%)',
                     backgroundSize: '200% 200%',
                     backgroundPosition: `${glare.x}% ${glare.y}%`,
                   }}
              />

              {/* Header */}
              <div className="flex justify-between items-start z-10 w-full mb-8">
                <div>
                  <div className="text-white font-black text-xl tracking-tight leading-none">EASY<span className="text-blue-500">FINANCE</span></div>
                  <div className="text-blue-400 text-[10px] tracking-[0.2em] font-bold mt-1">GLOBAL CRM</div>
                </div>
                {/* Microchip */}
                <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 relative overflow-hidden shadow-sm border border-yellow-500/50">
                  <div className="absolute inset-0 border border-yellow-800/20 rounded-md" />
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-800/20" />
                  <div className="absolute top-0 left-1/4 w-[1px] h-full bg-yellow-800/20" />
                  <div className="absolute top-0 right-1/4 w-[1px] h-full bg-yellow-800/20" />
                  <div className="absolute inset-1 rounded bg-yellow-300/30 border border-yellow-500/30" />
                </div>
              </div>

              {/* Avatar & User Details */}
              <div className="relative z-10 flex flex-col flex-1 items-start justify-center mt-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-[0.5px] border-slate-600 flex items-center justify-center text-3xl text-white font-bold shadow-xl mb-6 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {user?.initials || user?.name?.slice(0, 2).toUpperCase() || 'ID'}
                </div>
                
                <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-2 filter drop-shadow-md">
                  {user?.name || 'Jane Doe'}
                </h2>
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">
                  {user?.role || 'Executive'}
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="relative z-10 mt-auto border-t border-slate-700/50 pt-4 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <div className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-bold">Credential ID</div>
                  <div className="text-slate-300 font-mono text-xs tracking-wider">
                    {user?.id?.toString().padStart(4, '0')}-{(Math.floor(Math.random() * 9000) + 1000)}-CRX
                  </div>
                </div>
                
                {/* Authentic Badge */}
                <svg className="w-8 h-8 text-blue-500 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

            </div>
          </div>

          {/* ----- BACK OF CARD ----- */}
          <div 
            className="absolute inset-0 backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* The Animated Border Glow */}
            <div className="absolute -inset-[2px] rounded-[2rem] bg-slate-300 opacity-50 blur-[2px]" />
            
            {/* Card Body */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white flex flex-col p-6 overflow-hidden">
              
              <div className="w-full bg-slate-900 h-14 absolute top-8 left-0 shadow-inner" />
              
              <div className="mt-28 flex flex-col h-full z-10 px-2">
                <h3 className="text-xs font-black text-slate-400 tracking-[0.15em] uppercase mb-6 border-b border-slate-100 pb-2">
                  Contact Information
                </h3>
                
                <div className="space-y-5">
                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Range</p>
                    <p className="text-sm font-semibold text-slate-800 break-all select-all group-hover:text-blue-600 transition-colors">
                      {user?.email || 'jane.doe@easyfinance.test'}
                    </p>
                  </div>
                  
                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Direct Line</p>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {user?.phone || '+91 98765 43210'}
                    </p>
                  </div>

                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Auth Level</p>
                    <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                      {user?.role === 'admin' ? 'Level 5 (Admin)' : 'Level 3 (Standard)'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EF-${user?.id}`} alt="QR" className="w-14 h-14 rounded-lg bg-white p-1 shadow-sm border border-slate-200" />
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900 text-lg">EASYFINANCE</div>
                    <div className="text-slate-400 text-xs font-semibold tracking-wide">CONFIDENTIAL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Required Utility Classes injected via global css or tailwind for 3D */}
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .perspective-\\[2000px\\] { perspective: 2000px; }
      `}} />

    </div>
  )
}
