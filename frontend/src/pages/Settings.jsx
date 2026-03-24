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
      // 1. Load Local UI Preferences
      const themePref = await Preferences.get({ key: 'darkMode' });
      setDarkMode(themePref.value === 'true');

      if (isNative) {
        const bioPref = await Preferences.get({ key: 'biometric_enrolled' });
        setBiometricEnabled(bioPref.value === 'true');
      }

      // 2. Load User Profile from backend
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
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header mb-4">
        <h1 className="page-title">Settings</h1>
        <p className="text-muted">Manage your preferences and profile.</p>
      </header>

      <section className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-white border-bottom">
          <h2 className="h5 mb-0">Profile Management</h2>
        </div>
        <div className="card-body">
          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-3`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleProfileUpdate}>
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ minHeight: '48px', fontSize: '16px' }}
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required 
                />
              </div>
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control"
                  style={{ minHeight: '48px', fontSize: '16px' }}
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  required 
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">New Password (optional)</label>
                <input 
                  type="password" 
                  className="form-control"
                  style={{ minHeight: '48px', fontSize: '16px' }}
                  placeholder="Leave blank to keep current password"
                  value={profile.password} 
                  onChange={(e) => setProfile({...profile, password: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 w-md-auto mt-2" 
              disabled={loading} 
              style={{ minHeight: '48px', padding: '0 32px' }}
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </section>

      <section className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom">
          <h2 className="h5 mb-0">App Preferences</h2>
        </div>
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between align-items-center py-3 border-bottom-0">
              <div>
                <strong className="d-block">Dark Mode</strong>
                <small className="text-muted">Switch to a darker theme.</small>
              </div>
              <div className="form-check form-switch m-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  style={{ width: '48px', height: '24px', cursor: 'pointer' }}
                />
              </div>
            </li>

            {isNative && (
              <li className="list-group-item d-flex justify-content-between align-items-center py-3 border-top">
                <div>
                  <strong className="d-block">Biometric Login</strong>
                  <small className="text-muted">Use Fingerprint or Face ID.</small>
                </div>
                <div className="form-check form-switch m-0">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    checked={biometricEnabled}
                    onChange={toggleBiometric}
                    style={{ width: '48px', height: '24px', cursor: 'pointer' }}
                  />
                </div>
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
