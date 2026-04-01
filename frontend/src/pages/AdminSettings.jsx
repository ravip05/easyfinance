import React, { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'

export default function AdminSettings() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Settings State
  const [settings, setSettings] = useState({})
  const [users, setUsers] = useState([])
  const [stages, setStages] = useState([])
  const [logs, setLogs] = useState([])
  
  const tabs = [
    { id: 'company', label: 'Company Settings', icon: '🏢' },
    { id: 'users', label: 'Users & Access', icon: '👥' },
    { id: 'commission', label: 'Commission Slabs', icon: '💰' },
    { id: 'notifications', label: 'Notification Rules', icon: '🔔' },
    { id: 'leads', label: 'Lead Config', icon: '🎯' },
    { id: 'pipeline', label: 'Pipeline Stages', icon: '🛣️' },
    { id: 'bank-policies', label: 'Bank Policies', icon: '🏛️' },
    { id: 'lms', label: 'LMS Training', icon: '🎓' },
    { id: 'security', label: 'Security & Auth', icon: '🔐' },
    { id: 'audit', label: 'Audit Logs', icon: '📜' },
  ]

  useEffect(() => {
    fetchInitialData(true)
  }, [])

  async function fetchInitialData(isFirstTime = false) {
    if (isFirstTime) setLoading(true)
    else setRefreshing(true)
    
    try {
      const [sRes, uRes, pRes, aRes] = await Promise.all([
        apiClient.get('/admin/settings'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/pipeline-stages'),
        apiClient.get('/admin/audit-logs')
      ])
      setSettings(sRes.data || {})
      setUsers(Array.isArray(uRes.data) ? uRes.data : [])
      setStages(Array.isArray(pRes.data) ? pRes.data : [])
      setLogs(Array.isArray(aRes.data) ? aRes.data : [])
    } catch (err) {
      toast.error('Failed to load system settings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function handleSaveSettings(groupData) {
    setSaving(true)
    try {
      await apiClient.post('/admin/settings', groupData)
      toast.success('Settings updated successfully')
      setSettings(prev => ({ ...prev, ...groupData }))
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Initializing Control Plane...</div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )


  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>Admin Settings</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Configure system-wide parameters, rules, and branding.</p>
      </div>

      {/* Navigation Tabs (Demo replication style) */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        borderBottom: '1.5px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 0 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              transition: 'all 0.2s',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div style={{ position: 'relative', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', minHeight: '400px' }}>
        {refreshing && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', zIndex: 10 }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #f3f3f3', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Syncing...</span>
          </div>
        )}
        {activeTab === 'company' && (
          <CompanySettings settings={settings} onSave={handleSaveSettings} saving={saving} />
        )}
        {activeTab === 'users' && (
          <UsersManagement users={users} onReload={fetchInitialData} />
        )}
        {activeTab === 'commission' && (
          <CommissionSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
        )}
        {activeTab === 'notifications' && (
          <NotificationSettings settings={settings} onSave={handleSaveSettings} saving={saving} />
        )}
        {activeTab === 'leads' && (
          <LeadConfigSettings stages={stages} onSave={handleSaveSettings} saving={saving} />
        )}
        {activeTab === 'bank-policies' && (
          <BankPoliciesManagement onReload={fetchInitialData} />
        )}
        {activeTab === 'pipeline' && (
          <PipelineStagesManagement stages={stages} onReload={fetchInitialData} />
        )}
        {activeTab === 'lms' && (
          <LMSManagement />
        )}
        {activeTab === 'security' && (
          <SecuritySettings settings={settings} onSave={handleSaveSettings} saving={saving} />
        )}
        {activeTab === 'audit' && (
          <AuditLogPanel logs={logs} />
        )}
      </div>
    </div>
  )
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function CompanySettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    setForm({
      company_name: settings.company_name || '',
      company_tagline: settings.company_tagline || '',
      company_logo: settings.company_logo || '',
      company_address: settings.company_address || '',
      company_phone: settings.company_phone || '',
      company_email: settings.company_email || '',
      company_gstin: settings.company_gstin || '',
      company_pan: settings.company_pan || '',
      company_website: settings.company_website || '',
      cibil_link_1: settings.cibil_link_1 || '',
      cibil_link_2: settings.cibil_link_2 || '',
    })
  }, [settings])

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '40px' }}>
        <Field label="Company Legal Name" value={form.company_name} onChange={v => setForm({...form, company_name: v})} placeholder="e.g. EasyFinance Wale" />
        <Field label="Brand Tagline" value={form.company_tagline} onChange={v => setForm({...form, company_tagline: v})} placeholder="e.g. Loans Made Simple" />
        <Field label="Full Business Address" value={form.company_address} onChange={v => setForm({...form, company_address: v})} full placeholder="Enter complete office address" />
        <Field label="Support Phone" value={form.company_phone} onChange={v => setForm({...form, company_phone: v})} placeholder="+91 9988776655" />
        <Field label="Support Email" value={form.company_email} onChange={v => setForm({...form, company_email: v})} placeholder="help@crm.com" />
        <Field label="GSTIN Number" value={form.company_gstin} onChange={v => setForm({...form, company_gstin: v})} placeholder="27XXXXXXX" />
        <Field label="Business PAN" value={form.company_pan} onChange={v => setForm({...form, company_pan: v})} placeholder="ABCDE1234F" />
        <Field label="Website URL" value={form.company_website} onChange={v => setForm({...form, company_website: v})} placeholder="https://..." />
        <Field label="External CIBIL Link 1" value={form.cibil_link_1} onChange={v => setForm({...form, cibil_link_1: v})} placeholder="https://www.cibil.com" />
        <Field label="External CIBIL Link 2" value={form.cibil_link_2} onChange={v => setForm({...form, cibil_link_2: v})} placeholder="https://www.equifax.co.in" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
        <button type="submit" disabled={saving} style={{ ...btnStyle, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Synchronizing...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  )
}

function NotificationSettings({ settings, onSave, saving }) {
    const [form, setForm] = useState({})

    useEffect(() => {
        setForm({
            whatsapp_number: settings.whatsapp_number || '',
            smtp_host: settings.smtp_host || '',
            smtp_port: settings.smtp_port || '587',
            smtp_user: settings.smtp_user || '',
            smtp_pass: settings.smtp_pass || '',
            notif_leads: settings.notif_leads || '1',
        })
    }, [settings])

    function handleSubmit(e) { e.preventDefault(); onSave(form) }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '60px' }}>
                <div>
                     <h3 style={sectionTitle}>Notification Rules</h3>
                     <ToggleRow label="Alert on Lead Assignment" on={form.notif_leads === '1'} onClick={() => onSave({notif_leads: form.notif_leads === '1' ? '0' : '1'})} />
                     <ToggleRow label="Follow-up due reminder" on />
                     <ToggleRow label="Lead stage changed" on />
                     <ToggleRow label="Loan Sanctioned (Real-time)" on />
                     <ToggleRow label="Disbursement Success" on />
                </div>
                <div>
                    <h3 style={sectionTitle}>External API Channels</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Field label="WhatsApp Business Number" value={form.whatsapp_number} onChange={v => setForm({...form, whatsapp_number: v})} placeholder="+91..." />
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                           <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '16px' }}>SMTP MAIL SERVER</div>
                           <Field label="Host" value={form.smtp_host} onChange={v => setForm({...form, smtp_host: v})} placeholder="smtp.gmail.com" />
                           <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                               <Field label="Port" value={form.smtp_port} onChange={v => setForm({...form, smtp_port: v})} />
                               <Field label="Username" value={form.smtp_user} onChange={v => setForm({...form, smtp_user: v})} />
                           </div>
                        </div>
                    </div>
                </div>
            </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px', borderTop: '1px solid #f1f5f9', marginTop: '40px' }}>
                <button type="submit" disabled={saving} style={btnStyle}>
                    {saving ? 'Updating Channels...' : 'Save Notification Config'}
                </button>
            </div>
        </form>
    )
}

function CommissionSettings({ settings, onSave, saving }) {
    const [form, setForm] = useState({
        tds_rate: settings.tds_rate || '10',
        min_payout_threshold: settings.min_payout_threshold || '500',
        payout_cycle: settings.payout_cycle || 'monthly',
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                <div>
                    <h3 style={sectionTitle}>Payout Parameters</h3>
                    <Field label="TDS Deduction (%)" value={form.tds_rate} onChange={v => setForm({...form, tds_rate: v})} />
                    <Field label="Min Payout Threshold (₹)" value={form.min_payout_threshold} onChange={v => setForm({...form, min_payout_threshold: v})} />
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Payout Cycle</label>
                        <select 
                            value={form.payout_cycle} 
                            onChange={e => setForm({...form, payout_cycle: e.target.value})}
                            style={inputStyle}
                        >
                            <option value="weekly">Weekly</option>
                            <option value="fortnightly">Fortnightly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </div>
                <div>
                    <h3 style={sectionTitle}>Commission Slabs (Role-Based)</h3>
                    <div style={{ padding: '24px', background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '12px' }}>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: '#64748b' }}>ROLE TYPE</span>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: '#64748b' }}>BASE RATE</span>
                        </div>
                        {[
                            { r: 'Super Admin', v: '0.35%' },
                            { r: 'Branch Manager', v: '0.25%' },
                            { r: 'Field Executive', v: '0.15%' },
                            { r: 'DSA Partner', v: '0.10%' }
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{row.r}</span>
                                <span style={{ fontWeight: 800, color: '#2563eb' }}>{row.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                <button type="submit" disabled={saving} style={btnStyle}>Save Commission Slabs</button>
            </div>
        </form>
    )
}

function LeadConfigSettings({ stages, onSave, saving }) {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '60px' }}>
                <div>
                    <h3 style={sectionTitle}>Pipeline Architecture</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stages.map((s, i) => (
                            <div key={s.id} style={{ 
                                padding: '14px 20px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <span style={{ color: '#cbd5e1', fontSize: '18px' }}>☰</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.name}</span>
                                </div>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: s.color || '#2563eb' }} />
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 style={sectionTitle}>Lead Intake Rules</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>Define mandatory data points for new lead injections.</p>
                    <ToggleRow label="Aadhaar/PAN KYC" on />
                    <ToggleRow label="Employment Verification" on />
                    <ToggleRow label="Co-Applicant Details" />
                    <ToggleRow label="Property Geo-tagging" on />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px', borderTop: '1px solid #f1f5f9', marginTop: '40px' }}>
                <button style={btnStyle} disabled={saving}>Confirm Logic Update</button>
            </div>
        </div>
    )
}

function LMSManagement() {
  const [courses, setCourses] = useState([])
  const [materials, setMaterials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [cRes, mRes] = await Promise.all([
        apiClient.get('/lms/courses'),
        apiClient.get('/lms/materials')
      ])
      setCourses(cRes.data || [])
      setMaterials(mRes.data || [])
    } catch (e) {
      toast.error('Failed to load LMS data')
    }
    setIsLoading(false)
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>🎓 LMS & Training Management</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnStyle}>+ Upload Material</button>
          <button style={btnStyle}>+ Create Course</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Training Courses ({courses.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courses.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.category} · {c.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12 }}>
           <div style={{ fontWeight: 700, marginBottom: 16 }}>Study Materials ({materials.length})</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {materials.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{m.type} · {m.file_size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ settings, onSave, saving }) {
    const [form, setForm] = useState({
        two_factor_auth: settings.two_factor_auth || '0',
        session_timeout: settings.session_timeout || '30',
        backup_frequency: settings.backup_frequency || 'daily',
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '60px' }}>
                <div>
                    <h3 style={sectionTitle}>System Perimeter</h3>
                    <ToggleRow 
                        label="Strict Two-Factor Auth" 
                        on={form.two_factor_auth === '1'} 
                        onClick={() => setForm({...form, two_factor_auth: form.two_factor_auth === '1' ? '0' : '1'})}
                    />
                    <ToggleRow label="Biometric Hardware Lockout" on />
                    <ToggleRow label="IP Address Whitelisting" />
                    <div style={{ marginTop: '28px' }}>
                        <Field label="Inactivity Timeout (Min)" value={form.session_timeout} onChange={v => setForm({...form, session_timeout: v})} />
                    </div>
                </div>
                <div>
                    <h3 style={sectionTitle}>Data Preservation</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Configure automated cloud redundancy.</p>
                    <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Snapshot Frequency</label>
                    <select 
                        value={form.backup_frequency} 
                        onChange={e => setForm({...form, backup_frequency: e.target.value})}
                        style={inputStyle}
                    >
                        <option value="daily">Daily Incremental</option>
                        <option value="weekly">Weekly Full Rollup</option>
                        <option value="monthly">Monthly Master Archive</option>
                    </select>
                    <button type="button" style={{ 
                        marginTop: '28px', width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #2563eb', 
                        background: 'transparent', color: '#2563eb', fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                    }}>
                        Initialize Multi-Cloud Sync
                    </button>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px', borderTop: '1px solid #f1f5f9', marginTop: '40px' }}>
                <button type="submit" disabled={saving} style={btnStyle}>Seal Security Config</button>
            </div>
        </form>
    )
}

function UsersManagement({ users, onReload }) {
    const [selectedUser, setSelectedUser] = useState(null)
    const [showRegister, setShowRegister] = useState(false)
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', role: 'staff', department: '' })
    
    // Edit User Form State
    const [editForm, setEditForm] = useState({})
    
    const [newPassword, setNewPassword] = useState('')
    const [updating, setUpdating] = useState(false)
    const toast = useToast()

    // When a user is selected for editing, populate the editForm
    useEffect(() => {
        if (selectedUser) {
            setEditForm({
                name: selectedUser.name || '',
                email: selectedUser.email || '',
                phone: selectedUser.phone || '',
                role: selectedUser.role || 'staff',
                department: selectedUser.department || ''
            })
        }
    }, [selectedUser])

    async function handleRegisterUser(e) {
        e.preventDefault()
        if (!registerForm.name || !registerForm.email || !registerForm.phone) return toast.error('Please fill all required fields')
        setUpdating(true)
        try {
            await apiClient.post('/admin/users', registerForm)
            toast.success('User registered successfully')
            setShowRegister(false)
            setRegisterForm({ name: '', email: '', phone: '', role: 'staff', department: '' })
            onReload()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register user')
        } finally {
            setUpdating(false)
        }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault()
        setUpdating(true)
        try {
            await apiClient.patch(`/admin/users/${selectedUser.id}`, editForm)
            toast.success('Profile updated successfully')
            onReload()
            setSelectedUser(null)
        } catch (err) {
            toast.error('Failed to update profile')
        } finally {
            setUpdating(false)
        }
    }

    async function handleUpdatePassword(e) {
        e.preventDefault()
        if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters.')
        setUpdating(true)
        try {
            await apiClient.patch(`/admin/users/${selectedUser.id}`, { password: newPassword })
            toast.success('Password updated successfully')
            setNewPassword('')
            onReload()
            setSelectedUser(null)
        } catch (err) {
            toast.error('Failed to update password')
        } finally {
            setUpdating(false)
        }
    }

    async function handleToggleStatus(u) {
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
        if (!window.confirm(`Change status to ${newStatus}?`)) return
        try {
            await apiClient.patch(`/admin/users/${u.id}/status`, { status: newStatus })
            toast.success(`User marked as ${newStatus}`)
            onReload()
            setSelectedUser(null)
        } catch (err) {
            toast.error('Failed to update status')
        }
    }

    async function handleDeleteUser(id) {
        if (!window.confirm('Are you sure you want to delete this user? This is a soft-delete.')) return
        try {
            await apiClient.delete(`/admin/users/${id}`)
            toast.success('User soft-deleted successfully')
            onReload()
            setSelectedUser(null)
        } catch (err) {
            toast.error('Failed to delete user')
        }
    }

    async function handleRestoreUser(id) {
        try {
            await apiClient.post(`/admin/users/${id}/restore`)
            toast.success('User restored successfully')
            onReload()
        } catch (err) {
            toast.error('Failed to restore user')
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Access Matrix</h3>
                <button onClick={() => setShowRegister(true)} style={{ ...btnStyle, background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>+ Register Team</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                            <th style={thStyle}>Operator</th>
                            <th style={thStyle}>Identity / ID</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Vault Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, position: 'relative' }}>
                                            {u.name[0]}
                                            <div style={{ position: 'absolute', bottom: -5, right: -5, fontSize: '9px', background: '#2563eb', color: 'white', padding: '2px 4px', borderRadius: '4px', fontWeight: 800 }}>{u.emp_code}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={tdStyle}><span style={badgeStyle(u.role === 'admin' ? '#dcfce7' : '#f1f5f9', u.role === 'admin' ? '#166534' : '#475569')}>{u.role.toUpperCase()}</span></td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.deleted_at ? '#94a3b8' : (u.status === 'Active' ? '#10b981' : '#f43f5e') }} />
                                        <span style={{ fontWeight: 600, color: u.deleted_at ? '#94a3b8' : '#1e293b' }}>{u.deleted_at ? 'Deleted' : u.status}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => setSelectedUser(u)} style={{ color: '#2563eb', border: 'none', background: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keys & Access</button>
                                        {u.deleted_at && (
                                            <button onClick={() => handleRestoreUser(u.id)} style={{ color: '#059669', border: 'none', background: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restore</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <div className="modal-overlay open" onClick={() => setSelectedUser(null)}>
                    <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">🔐 Manage Access: {selectedUser.name}</div>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateProfile} style={{ marginBottom: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <Field label="Full Name" value={editForm.name} onChange={v => setEditForm({...editForm, name: v})} />
                                    <Field label="Email Address" value={editForm.email} onChange={v => setEditForm({...editForm, email: v})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <Field label="Phone Number" value={editForm.phone} onChange={v => setEditForm({...editForm, phone: v})} />
                                    <Field label="Department" value={editForm.department} onChange={v => setEditForm({...editForm, department: v})} />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Access Level (Role)</label>
                                    <select 
                                        value={editForm.role} 
                                        onChange={e => setEditForm({...editForm, role: e.target.value})}
                                        style={inputStyle}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                        <option value="dsa">DSA (Franchise)</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={updating}>
                                    {updating ? 'Saving...' : 'Save Profile Details'}
                                </button>
                            </form>

                            <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '24px 0' }} />

                            <form onSubmit={handleUpdatePassword} style={{ marginBottom: 24 }}>
                                <Field 
                                    label="Force Password Reset" 
                                    value={newPassword} 
                                    onChange={setNewPassword} 
                                    placeholder="Enter new password (min 6 chars)" 
                                />
                                <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 12, width: '100%', background: '#475569', borderColor: '#475569' }} disabled={updating}>
                                    {updating ? 'Updating...' : 'Force Reset Password'}
                                </button>
                            </form>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>Account Status</div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Currently: {selectedUser.status}</div>
                                </div>
                                <button 
                                    onClick={() => handleToggleStatus(selectedUser)}
                                    className={`btn btn-sm ${selectedUser.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                                    style={{ 
                                        backgroundColor: selectedUser.status === 'Active' ? '#fef2f2' : '#f0fdf4', 
                                        color: selectedUser.status === 'Active' ? '#dc2626' : '#166534',
                                        border: `1px solid ${selectedUser.status === 'Active' ? '#fecaca' : '#bbf7d0'}`,
                                        padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                                    }}
                                >
                                    {selectedUser.status === 'Active' ? 'Block Account' : 'Reactivate'}
                                </button>
                                {!selectedUser.deleted_at && (
                                    <button 
                                        onClick={() => handleDeleteUser(selectedUser.id)}
                                        style={{ 
                                            backgroundColor: '#fff1f2', 
                                            color: '#e11d48',
                                            border: '1px solid #fecdd3',
                                            padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                                        }}
                                    >
                                        Delete User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRegister && (
                <div className="modal-overlay open" onClick={() => setShowRegister(false)}>
                    <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">👥 Register Team Member</div>
                            <button className="modal-close" onClick={() => setShowRegister(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleRegisterUser}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <Field label="Full Name *" value={registerForm.name} onChange={v => setRegisterForm({...registerForm, name: v})} placeholder="Amit Sharma" />
                                    <Field label="Email Address *" value={registerForm.email} onChange={v => setRegisterForm({...registerForm, email: v})} placeholder="amit@crm.com" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <Field label="Phone (10 digits) *" value={registerForm.phone} onChange={v => setRegisterForm({...registerForm, phone: v})} placeholder="9988776655" />
                                    <Field label="Department" value={registerForm.department} onChange={v => setRegisterForm({...registerForm, department: v})} placeholder="Home Loans" />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Access Level (Role) *</label>
                                    <select 
                                        value={registerForm.role} 
                                        onChange={e => setRegisterForm({...registerForm, role: e.target.value})}
                                        style={inputStyle}
                                    >
                                        <option value="staff">Staff (Limited View)</option>
                                        <option value="manager">Manager (Team View)</option>
                                        <option value="admin">Super Admin (All Access)</option>
                                        <option value="dsa">DSA (Franchise Partner)</option>
                                    </select>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <strong>Note:</strong> Default password will be set to the user's phone number. They must change it upon first login.
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800 }} disabled={updating}>
                                    {updating ? 'Registering...' : 'Register User'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


function PipelineStagesManagement({ stages, onReload }) {
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    async function handleUpdate(id, data) {
        setLoading(true)
        try {
            await apiClient.post('/admin/pipeline-stages', { stages: stages.map(s => s.id === id ? { ...s, ...data } : s) })
            toast.success('Stage updated')
            onReload()
        } catch (err) {
            toast.error('Update failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Workflow Stages</h3>
                <button style={{ ...btnStyle, fontSize: '13px', padding: '12px 24px' }}>+ New Stage</button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
                {stages.map((s, i) => (
                    <div key={s.id} style={{ 
                        padding: '20px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>{i + 1}</div>
                            <div>
                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>{s.name}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Active in Global Pipeline</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>LABEL COLOR</span>
                                 <input type="color" value={s.color_class || '#2563eb'} onChange={e => handleUpdate(s.id, { color_class: e.target.value })} style={{ border: 'none', padding: 0, width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }} />
                             </div>
                             <button style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>REMOVE</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function BankPoliciesManagement({ onReload }) {
    const [policies, setPolicies] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({
        name: '', short_code: '', logo_code: 'Bank', brand_color: '#2563eb', bank_type: 'Private',
        hl_interest_rate: '', hl_max_amount: '', hl_max_tenure: '', hl_ltv: '',
        bl_interest_rate: '', bl_max_amount: '', bl_max_tenure: '',
        pl_interest_rate: '', pl_max_amount: '', pl_max_tenure: '',
        cibil_min: 700, min_income: '', age_range: '21-60', processing_fee: '', highlight: ''
    })
    const toast = useToast()

    useEffect(() => { load() }, [])
    async function load() {
        setLoading(true)
        try {
            const res = await apiClient.get('/bank-policies')
            setPolicies(res.data)
        } finally { setLoading(false) }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            if (editing) await apiClient.put(`/bank-policies/${editing.id}`, form)
            else await apiClient.post('/bank-policies', form)
            toast.success(`Policy ${editing ? 'updated' : 'created'}`)
            setShowModal(false)
            setEditing(null)
            load()
            onReload()
        } catch (err) {
            toast.error('Operation failed')
        } finally { setLoading(false) }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Lending Policies</h3>
                <button onClick={() => { setEditing(null); setForm({ name: '', short_code: '', logo_code: 'Bank', brand_color: '#2563eb', bank_type: 'Private', hl_interest_rate: '', hl_max_amount: '', hl_max_tenure: '', hl_ltv: '', bl_interest_rate: '', bl_max_amount: '', bl_max_tenure: '', pl_interest_rate: '', pl_max_amount: '', pl_max_tenure: '', cibil_min: 700, min_income: '', age_range: '21-60', processing_fee: '', highlight: '' }); setShowModal(true) }} style={btnStyle}>+ Add Entry</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {policies.map(p => (
                    <div key={p.id} style={{ padding: '24px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '20px', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: p.brand_color || '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>{p.logo_code || p.name[0]}</div>
                            <div>
                                <div style={{ fontWeight: 800, color: '#1e293b' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{p.bank_type} • {p.short_code}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setEditing(p); setForm(p); setShowModal(true) }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                            <button onClick={async () => { if(window.confirm('Delete?')) { await apiClient.delete(`/bank-policies/${p.id}`); load() } }} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay open" onClick={() => setShowModal(false)} style={{ zIndex: 9999 }}>
                    <div className="modal" style={{ maxWidth: 800, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editing ? '📝 Edit Policy' : '🏛️ New Lending Policy'}</div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Basic Information</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        <Field label="Bank Name" value={form.name} onChange={v => setForm({...form, name: v})} />
                                        <Field label="Short Code" value={form.short_code} onChange={v => setForm({...form, short_code: v})} />
                                        <Field label="Logo Text" value={form.logo_code} onChange={v => setForm({...form, logo_code: v})} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <Field label="Brand Color (Hex)" value={form.brand_color} onChange={v => setForm({...form, brand_color: v})} />
                                        <div>
                                            <label style={labelStyle}>Bank Type</label>
                                            <select style={inputStyle} value={form.bank_type} onChange={e => setForm({...form, bank_type: e.target.value})}>
                                                <option>PSU</option>
                                                <option>Private</option>
                                                <option>NBFC</option>
                                                <option>HFC</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {/* Home Loan */}
                                    <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '16px', border: '1px solid #dbeafe' }}>
                                        <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase' }}>Home Loan Terms</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <Field label="Interest Rate" value={form.hl_interest_rate} onChange={v => setForm({...form, hl_interest_rate: v})} placeholder="8.50%" />
                                            <Field label="Max Amount" value={form.hl_max_amount} onChange={v => setForm({...form, hl_max_amount: v})} placeholder="10Cr" />
                                            <Field label="Max Tenure" value={form.hl_max_tenure} onChange={v => setForm({...form, hl_max_tenure: v})} placeholder="30 yrs" />
                                            <Field label="Max LTV" value={form.hl_ltv} onChange={v => setForm({...form, hl_ltv: v})} placeholder="90%" />
                                        </div>
                                    </div>

                                    {/* Business Loan */}
                                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #dcfce7' }}>
                                        <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 900, color: '#166534', textTransform: 'uppercase' }}>Business Loan Terms</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <Field label="Interest Rate" value={form.bl_interest_rate} onChange={v => setForm({...form, bl_interest_rate: v})} />
                                            <Field label="Max Amount" value={form.bl_max_amount} onChange={v => setForm({...form, bl_max_amount: v})} />
                                            <Field label="Max Tenure" value={form.bl_max_tenure} onChange={v => setForm({...form, bl_max_tenure: v})} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                                    {/* Personal Loan */}
                                    <div style={{ background: '#fdf2f8', padding: '20px', borderRadius: '16px', border: '1px solid #fce7f3' }}>
                                        <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 900, color: '#9d174d', textTransform: 'uppercase' }}>Personal Loan Terms</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <Field label="Interest Rate" value={form.pl_interest_rate} onChange={v => setForm({...form, pl_interest_rate: v})} />
                                            <Field label="Max Amount" value={form.pl_max_amount} onChange={v => setForm({...form, pl_max_amount: v})} />
                                            <Field label="Max Tenure" value={form.pl_max_tenure} onChange={v => setForm({...form, pl_max_tenure: v})} />
                                        </div>
                                    </div>

                                    {/* Eligibility */}
                                    <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '16px', border: '1px solid #fef3c7' }}>
                                        <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 900, color: '#92400e', textTransform: 'uppercase' }}>Eligibility & Fees</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <Field label="Min CIBIL" value={form.cibil_min} onChange={v => setForm({...form, cibil_min: v})} />
                                            <Field label="Min Income" value={form.min_income} onChange={v => setForm({...form, min_income: v})} />
                                            <Field label="Proc. Fee" value={form.processing_fee} onChange={v => setForm({...form, processing_fee: v})} />
                                            <Field label="Age Range" value={form.age_range} onChange={v => setForm({...form, age_range: v})} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px' }}>
                                    <Field label="Special Highlights (Internal Tip)" value={form.highlight} onChange={v => setForm({...form, highlight: v})} full placeholder="e.g. Fastest approval for govt employees" />
                                </div>

                                <button type="submit" disabled={loading} style={{ ...btnStyle, width: '100%', marginTop: '32px' }}>
                                    {loading ? 'Publishing...' : (editing ? 'Update Policy' : 'Create Policy')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AuditLogPanel({ logs }) {
    return (
        <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '32px' }}>System Audit Trail</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                            <th style={thStyle}>Timestamp</th>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Action</th>
                            <th style={thStyle}>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colSpan="4" style={{...tdStyle, textAlign: 'center', color: '#64748b'}}>No audit records found.</td></tr>
                        ) : logs.map(lg => (
                            <tr key={lg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={tdStyle}>{new Date(lg.created_at).toLocaleString()}</td>
                                <td style={{...tdStyle, fontWeight: 600}}>{lg.user?.name || 'System Account'}</td>
                                <td style={{...tdStyle, color: '#334155'}}>{lg.action}</td>
                                <td style={{...tdStyle, color: '#94a3b8', fontSize: '12px'}}>{lg.ip_address || '127.0.0.1'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ── Shared UI Elements ────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, full = false }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.06)' }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#fcfdfe'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function ToggleRow({ label, on = false, onClick }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1.5px solid #f1f5f9' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{label}</span>
            <div onClick={onClick} style={{ width: '48px', height: '26px', background: on ? '#2563eb' : '#e2e8f0', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: on ? '25px' : '3px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </div>
        </div>
    )
}

const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '15px', fontWeight: 500, color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#fcfdfe' }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }
const btnStyle = { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', padding: '16px 36px', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.25)', transition: 'all 0.2s' }
const sectionTitle = { fontSize: '12px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '32px', borderLeft: '4px solid #2563eb', paddingLeft: '16px' }
const thStyle = { padding: '16px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }
const tdStyle = { padding: '24px 12px', fontSize: '14px', color: '#1e293b' }
const badgeStyle = (bg, f) => ({ padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, background: bg, color: f, letterSpacing: '0.05em', textTransform: 'uppercase' })
