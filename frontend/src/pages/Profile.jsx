import { useState } from 'react'
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
    <div id="page-profile" className="page active" style={{ paddingBottom: 80 }}>
      {/* Premium Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
        borderRadius: 'var(--radius)',
        height: 140,
        position: 'relative',
        marginBottom: 80,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Overlapping Profile Card */}
        <div className="card" style={{
          position: 'absolute',
          bottom: '-60px',
          left: 40,
          right: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: 20
        }}>
          <div className="profile-av" style={{ width: 80, height: 80, fontSize: 28, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
            {user?.initials || user?.name?.slice(0, 2).toUpperCase() || 'AU'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="profile-name" style={{ fontSize: 24, marginBottom: 4 }}>{user?.name}</h2>
            <div className="profile-meta" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${user?.role === 'admin' ? 'badge-high' : 'badge-active'}`}>{user?.role?.toUpperCase()}</span>
              <span>✉️ {user?.email}</span>
              {user?.phone && <span>📞 {user?.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 40px' }}>
        <div className="tabs">
          <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            👤 Personal Details
          </div>
          <div className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            🔒 Security
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <div className="card-title">{activeTab === 'profile' ? 'Personal Details' : 'Change Password'}</div>
          </div>
          <div className="card-body">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input className="form-input" type="text" name="name" value={form.name} onChange={handleProfileChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" name="email" value={form.email} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" type="tel" name="phone" value={form.phone} onChange={handleProfileChange} />
                  </div>
                </div>
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : '✓ Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Current Password</label>
                    <input className="form-input" type="password" name="current_password" value={passwordForm.current_password} onChange={handlePasswordChange} placeholder="Leave blank if you don't want to change password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" name="new_password" value={passwordForm.new_password} onChange={handlePasswordChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-input" type="password" name="new_password_confirmation" value={passwordForm.new_password_confirmation} onChange={handlePasswordChange} />
                  </div>
                </div>
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Updating...' : '🔒 Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
