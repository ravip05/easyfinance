import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import apiClient from '../api/client';

const isNative = Capacitor.isNativePlatform();

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', phone: '', password: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const themePref = await Preferences.get({ key: 'darkMode' });
      setDarkMode(themePref.value === 'true');

      if (isNative) {
        const bioPref = await Preferences.get({ key: 'biometric_enrolled' });
        setBiometricEnabled(bioPref.value === 'true');
      }

      const { data } = await apiClient.get('/api/user/settings');
      if (data?.user) {
        setProfile(prev => ({
          ...prev,
          name: data.user.name || '',
          phone: data.user.phone || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const payload = { name: profile.name, phone: profile.phone };
      if (profile.password) {
        payload.password = profile.password;
      }
      
      await apiClient.post('/api/settings/profile', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setProfile(prev => ({ ...prev, password: '' })); // clear password field
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await Preferences.set({ key: 'darkMode', value: String(newMode) });
    document.documentElement.classList.toggle('dark', newMode);
  };

  const toggleBiometric = async () => {
    const newStatus = !biometricEnabled;
    setBiometricEnabled(newStatus);
    await Preferences.set({ key: 'biometric_enrolled', value: String(newStatus) });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500 pb-20">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 inline-block mb-2">
            Settings & Preferences
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your account, security, and app experience.</p>
        </header>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl backdrop-blur-md border flex items-center gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            <span className="text-xl">{message.type === 'success' ? '✨' : '⚠️'}</span>
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings Nav Sidebar (visual only) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-2">
              <div className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 font-semibold text-blue-600 dark:text-blue-400 cursor-pointer flex items-center gap-3 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Profile
              </div>
              <div className="px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-white/50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                App Data
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-9 space-y-8">
            {/* Profile Card */}
            <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200/50 dark:border-slate-700/50 transition-all hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)]">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Identity</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your contact bounds</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Link</label>
                    <input 
                      type="tel" 
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Authentication Token (Password)</label>
                    <input 
                      type="password" 
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder="Enter new password to change, or leave blank"
                      value={profile.password} 
                      onChange={(e) => setProfile({...profile, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className="relative flex items-center gap-2">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      )}
                      <span>{loading ? 'Processing...' : 'Save Changes'}</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>

            {/* Experience Card */}
            <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200/50 dark:border-slate-700/50 transition-all hover:shadow-[0_8px_30px_rgb(124,58,237,0.08)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Experience Details</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Configure your local hardware</p>
                </div>
              </div>

              <div className="space-y-2">
                
                {/* Dark Mode Toggle */}
                <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={toggleDarkMode}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {darkMode ? '🌙' : '☀️'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">Deep Mode</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Cinematic dark visuals</p>
                    </div>
                  </div>
                  
                  {/* Custom Switch */}
                  <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${darkMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Biometric Toggle */}
                {isNative && (
                  <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={toggleBiometric}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {biometricEnabled ? '🛡️' : '🔓'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Biometric Vault</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Unlock via FaceID or Fingerprint</p>
                      </div>
                    </div>
                    
                    {/* Custom Switch */}
                    <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${biometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${biometricEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                )}
                
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Required Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />

    </div>
  );
}
