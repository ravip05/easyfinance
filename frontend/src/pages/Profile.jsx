import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import apiClient from '../api/client'

export default function Profile() {
  const { user, login } = useAuth()
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
      const { data } = await apiClient.post('/settings/profile', form)
      toast('success', 'Profile updated successfully.')
      // Update local storage context if needed, though usually just re-fetching me works.
      // Easiest is to let context know, but for now we'll just show success.
    } catch (error) {
      toast('error', error.response?.data?.message || 'Failed to update profile.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      return toast('error', 'New passwords do not match')
    }
    setIsLoading(true)
    try {
      await apiClient.post('/settings/password', passwordForm)
      toast('success', 'Password updated successfully.')
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (error) {
      toast('error', error.response?.data?.message || 'Failed to update password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header mb-4">
        <h1 className="page-title">My Account</h1>
        <p className="text-muted">Manage your profile, preferences, and security settings.</p>
      </header>

      <div className="row">
        <div className="col-12 col-md-4 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div 
                className="user-avatar mx-auto mb-3" 
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}
              >
                {user?.initials || user?.name?.slice(0, 2).toUpperCase() || '??'}
              </div>
              <h3 className="h5 mb-1 fw-bold">{user?.name}</h3>
              <p className="text-muted mb-3">{user?.role?.toUpperCase()}</p>
              
              <div className="w-100 mt-4 text-start">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Email:</span>
                  <span className="small fw-medium">{user?.email}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Phone:</span>
                  <span className="small fw-medium">{user?.phone || '—'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Role:</span>
                  <span className="badge bg-primary bg-opacity-10 text-primary">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <ul className="nav nav-tabs border-bottom-0">
                <li className="nav-item">
                  <button 
                    className={`nav-link border-0 text-dark ${activeTab === 'profile' ? 'fw-bold border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('profile')}
                    style={{ background: 'transparent' }}
                  >
                    Personal Details
                  </button>
                </li>
                <li className="nav-item ms-3">
                  <button 
                    className={`nav-link border-0 text-dark ${activeTab === 'security' ? 'fw-bold border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('security')}
                    style={{ background: 'transparent' }}
                  >
                    Security
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4 pt-3">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={form.name} 
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={form.email} 
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small">Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        name="phone"
                        value={form.phone} 
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-end">
                    <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small">Current Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Leave blank if you don't want to change password"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small">New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-muted small">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="new_password_confirmation"
                        value={passwordForm.new_password_confirmation}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-end">
                    <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
