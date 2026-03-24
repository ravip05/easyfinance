import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import apiClient from '../api/client'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  function handleProfileChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await apiClient.post('/settings/profile', form)
      toast?.('success', 'Profile updated successfully.')
    } catch (error) {
      toast?.('error', error.response?.data?.message || 'Failed to update profile.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      return toast?.('error', 'New passwords do not match')
    }
    setIsLoading(true)
    try {
      await apiClient.post('/settings/password', passwordForm)
      toast?.('success', 'Password updated successfully.')
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (error) {
      toast?.('error', error.response?.data?.message || 'Failed to update password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500 pb-24">
      
      {/* Background Animated Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Profile Banner */}
        <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 mb-20 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Floating Profile Info Overlap */}
        <div className="relative -mt-32 md:-mt-40 mb-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-6 md:px-12 w-full">
          {/* Avatar Base */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-slate-900 rounded-3xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden">
              <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">
                {user?.initials || user?.name?.slice(0, 2).toUpperCase() || 'ID'}
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Status Indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-50 dark:border-slate-800" />
          </div>

          <div className="text-center md:text-left flex-1 pb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              {user?.name || 'Administrator'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                {user?.role || 'User'} Level
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {user?.email || 'email@easyfinance.com'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex p-1 mb-8 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl w-full max-w-sm mx-auto border border-slate-300/50 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-[0_2px_10px_rgba(0,0,0,0.1)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Identity
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-[0_2px_10px_rgba(0,0,0,0.1)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Vault Security
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)]">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              {activeTab === 'profile' ? 'Core Identity Data' : 'Authentication Settings'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'profile' ? 'Update your personal details across the global namespace.' : 'Strengthen your perimeter and reset keys.'}
            </p>
          </div>

          <div className="relative">
            {/* The form transitions */}
            <div className={`transition-all duration-500 ${activeTab === 'profile' ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none translate-x-10'}`}>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" type="text" name="name" value={form.name} onChange={handleProfileChange} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Communication Channel</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" type="email" name="email" value={form.email} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Direct Connect Line</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" type="tel" name="phone" value={form.phone} onChange={handleProfileChange} />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button type="submit" disabled={isLoading} className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10">{isLoading ? 'Synchronizing...' : 'Save Profile Identity'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className={`transition-all duration-500 ${activeTab === 'security' ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-10'}`}>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Master Key</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm placeholder-slate-400/50" type="password" name="current_password" value={passwordForm.current_password} onChange={handlePasswordChange} placeholder="Enter your current password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">New Encrypted Key</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" type="password" name="new_password" value={passwordForm.new_password} onChange={handlePasswordChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verify New Key</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" type="password" name="new_password_confirmation" value={passwordForm.new_password_confirmation} onChange={handlePasswordChange} />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button type="submit" disabled={isLoading} className="group relative px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      {isLoading ? 'Updating Vault...' : 'Secure Update Key'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
