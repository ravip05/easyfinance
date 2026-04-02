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
  const [commissionSlabs, setCommissionSlabs] = useState([])
  const [logs, setLogs] = useState([])
  
  const tabs = [
    { id: 'company', label: 'Company Settings', icon: '🏢' },
    { id: 'users', label: 'Users & Access', icon: '👥' },
    { id: 'departments', label: 'Departments', icon: '🏬' },
    { id: 'commission', label: 'Commission & Slabs', icon: '💰' },
    { id: 'allocation', label: 'Team Allocation', icon: '🔀' },
    { id: 'notifications', label: 'Notification Rules', icon: '🔔' },
    { id: 'leads', label: 'Lead Config', icon: '🎯' },
    { id: 'pipeline', label: 'Pipeline Stages', icon: '🛣️' },
    { id: 'bank-policies', label: 'Bank Policies', icon: '🏛️' },
    { id: 'lms', label: 'LMS Training', icon: '🎓' },
    { id: 'security', label: 'Security & Geofencing', icon: '🔐' },
    { id: 'audit', label: 'Audit Logs', icon: '📜' },
  ]

  useEffect(() => {
    fetchInitialData(true)
  }, [])

  async function fetchInitialData(isFirstTime = false) {
    if (isFirstTime) setLoading(true)
    else setRefreshing(true)
    
    try {
      const [sRes, uRes, pRes, aRes, cRes] = await Promise.all([
        apiClient.get('/admin/settings'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/pipeline-stages'),
        apiClient.get('/admin/audit-logs'),
        apiClient.get('/admin/commission-slabs')
      ])
      setSettings(sRes.data || {})
      setUsers(Array.isArray(uRes.data) ? uRes.data : [])
      setStages(Array.isArray(pRes.data) ? pRes.data : [])
      setLogs(Array.isArray(aRes.data) ? aRes.data : [])
      setCommissionSlabs(Array.isArray(cRes.data) ? cRes.data : [])
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
          <CommissionSettings 
            settings={settings} 
            slabs={commissionSlabs} 
            onSave={handleSaveSettings} 
            onUpdateSlabs={(newSlabs) => setCommissionSlabs(newSlabs)}
            onReload={fetchInitialData}
            saving={saving} 
          />
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
        {activeTab === 'departments' && (
          <DepartmentsManagement />
        )}
        {activeTab === 'allocation' && (
          <TeamAllocationManagement />
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

function CommissionSettings({ settings, slabs, onSave, onUpdateSlabs, onReload, saving }) {
    const toast = useToast()
    const [payoutForm, setPayoutForm] = useState({
        tds_rate: settings.tds_rate || '10',
        min_payout_threshold: settings.min_payout_threshold || '500',
        payout_cycle: settings.payout_cycle || 'monthly',
    })
    const [editSlabs, setEditSlabs] = useState([])

    useEffect(() => {
        setEditSlabs(slabs)
    }, [slabs])

    const handleAddSlab = () => {
        setEditSlabs([...editSlabs, { role: 'staff', loan_type: 'All', rate: 0.1, min_disbursement: 0, is_active: true }])
    }

    const handleUpdateSlabField = (idx, field, value) => {
        const updated = [...editSlabs]
        updated[idx][field] = value
        setEditSlabs(updated)
    }

    const handleDeleteSlab = async (slab) => {
        if (!slab.id) return setEditSlabs(editSlabs.filter((_, i) => editSlabs[i] !== slab))
        if (!window.confirm('Delete this slab?')) return
        try {
            await apiClient.delete(`/admin/commission-slabs/${slab.id}`)
            toast.success('Slab deleted')
            onReload()
        } catch { toast.error('Failed to delete slab') }
    }

    const handleSaveSlabs = async () => {
        try {
            await apiClient.post('/admin/commission-slabs', { slabs: editSlabs })
            toast.success('Commission slabs updated')
            onReload()
        } catch { toast.error('Failed to update slabs') }
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                <div>
                    <h3 style={sectionTitle}>Payout Parameters</h3>
                    <Field label="TDS Deduction (%)" value={payoutForm.tds_rate} onChange={v => setPayoutForm({...payoutForm, tds_rate: v})} />
                    <Field label="Min Payout Threshold (₹)" value={payoutForm.min_payout_threshold} onChange={v => setPayoutForm({...payoutForm, min_payout_threshold: v})} />
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Payout Cycle</label>
                        <select 
                            value={payoutForm.payout_cycle} 
                            onChange={e => setPayoutForm({...payoutForm, payout_cycle: e.target.value})}
                            style={inputStyle}
                        >
                            <option value="weekly">Weekly</option>
                            <option value="fortnightly">Fortnightly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => onSave(payoutForm)}>Update Payout Rules</button>
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ ...sectionTitle, margin: 0 }}>Role-Based Slabs</h3>
                        <button className="btn btn-secondary btn-sm" onClick={handleAddSlab}>+ Add Slab</button>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {editSlabs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>No slabs configured.</div>
                        ) : editSlabs.map((s, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 40px', gap: 8, alignItems: 'center', background: '#fff', padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <select 
                                    value={s.role} 
                                    onChange={e => handleUpdateSlabField(i, 'role', e.target.value)}
                                    style={{ ...inputStyle, padding: '4px 8px', fontSize: 12 }}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="dsa">DSA Partner</option>
                                    <option value="admin">Super Admin</option>
                                </select>
                                <select 
                                    value={s.loan_type} 
                                    onChange={e => handleUpdateSlabField(i, 'loan_type', e.target.value)}
                                    style={{ ...inputStyle, padding: '4px 8px', fontSize: 12 }}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Home Loan">Home Loan</option>
                                    <option value="Business Loan">Business Loan</option>
                                    <option value="Personal Loan">Personal Loan</option>
                                    <option value="LAP">LAP</option>
                                    <option value="Insurance">Insurance</option>
                                </select>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={s.rate} 
                                        onChange={e => handleUpdateSlabField(i, 'rate', parseFloat(e.target.value))}
                                        style={{ ...inputStyle, padding: '4px 8px', fontSize: 12, paddingRight: 16 }}
                                    />
                                    <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#94a3b8' }}>%</span>
                                </div>
                                <button onClick={() => handleDeleteSlab(s)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" disabled={saving} style={btnStyle} onClick={handleSaveSlabs}>Sync Commission Logic</button>
            </div>
        </div>
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
  const [quizzes, setQuizzes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const toast = useToast()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [cRes, mRes, qRes] = await Promise.all([
        apiClient.get('/lms/courses'),
        apiClient.get('/lms/materials'),
        apiClient.get('/lms/quizzes'),
      ])
      setCourses(cRes.data || [])
      setMaterials(mRes.data || [])
      setQuizzes(qRes.data || [])
    } catch (e) {
      toast.error('Failed to load LMS data')
    }
    setIsLoading(false)
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm('Delete this course?')) return
    try { await apiClient.delete(`/lms/courses/${id}`); toast.success('Course deleted'); fetchData() } catch { toast.error('Delete failed') }
  }

  async function handleDeleteMaterial(id) {
    if (!window.confirm('Delete this material?')) return
    try { await apiClient.delete(`/lms/materials/${id}`); toast.success('Material deleted'); fetchData() } catch { toast.error('Delete failed') }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>🎓 LMS & Training Management</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnStyle} onClick={() => setShowMaterialModal(true)}>+ Upload Material</button>
          <button style={btnStyle} onClick={() => { setEditingCourse(null); setShowCourseModal(true) }}>+ Create Course</button>
          <button style={{ ...btnStyle, background: '#7c3aed', borderColor: '#7c3aed' }} onClick={() => setShowQuizModal(true)}>+ Create Quiz</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Courses List */}
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Training Courses ({courses.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courses.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.category} · {c.level} · {c.lesson_count || 0} lessons</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => { setEditingCourse(c); setShowLessonModal(true) }} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Manage Lessons</button>
                  <button onClick={() => { setEditingCourse(c); setShowCourseModal(true) }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#2563eb', fontWeight: 700 }}>Edit</button>
                  <button onClick={() => handleDeleteCourse(c.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials List */}
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12 }}>
           <div style={{ fontWeight: 700, marginBottom: 16 }}>Study Materials ({materials.length})</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {materials.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{m.type} · {m.file_size} · {m.uploader?.name || ''}</div>
                </div>
                <button onClick={() => handleDeleteMaterial(m.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Quizzes ({quizzes.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quizzes.map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{q.questions_count || 0} questions · Pass: {q.passing_score}% · {q.time_limit_minutes}min</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={async () => { if(window.confirm('Delete quiz?')) { await apiClient.delete(`/lms/quizzes/${q.id}`); toast.success('Quiz deleted'); fetchData() } }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Delete</button>
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && <CourseFormModal course={editingCourse} onClose={() => setShowCourseModal(false)} onSuccess={() => { setShowCourseModal(false); fetchData() }} />}
      {/* Material Modal */}
      {showMaterialModal && <MaterialUploadModal onClose={() => setShowMaterialModal(false)} onSuccess={() => { setShowMaterialModal(false); fetchData() }} />}
      {/* Quiz Modal */}
      {showQuizModal && <QuizBuilderModal courses={courses} onClose={() => setShowQuizModal(false)} onSuccess={() => { setShowQuizModal(false); fetchData() }} />}
      {/* Lesson Modal */}
      {showLessonModal && <LessonManagementModal course={editingCourse} onClose={() => setShowLessonModal(false)} onSuccess={() => { setShowLessonModal(false); fetchData() }} />}
    </div>
  )
}

// ── Course Create/Edit Modal ──
function CourseFormModal({ course, onClose, onSuccess }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: course?.title || '',
    category: course?.category || 'loans',
    level: course?.level || 'beginner',
    duration_minutes: course?.duration_minutes || 60,
    thumbnail: course?.thumbnail || '📘',
    is_active: course?.is_active !== false,
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      if (course?.id) {
        await apiClient.patch(`/lms/courses/${course.id}`, form)
        toast.success('Course updated')
      } else {
        await apiClient.post('/lms/courses', form)
        toast.success('Course created')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{course ? '✏️ Edit Course' : '📘 Create Course'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label">Course Title <span className="req">*</span></div>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Home Loan Basics" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <div className="form-label">Category</div>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['loans','insurance','sales','compliance','franchise'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <div className="form-label">Level</div>
                <select className="form-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {['beginner','intermediate','advanced'].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <div className="form-label">Duration (minutes)</div>
                <input className="form-input" type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} onFocus={e => e.target.select()} />
              </div>
              <div className="form-group">
                <div className="form-label">Thumbnail Emoji</div>
                <input className="form-input" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="📘" />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: 0, paddingTop: 16, border: 'none' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Material Upload Modal (Real file upload) ──
function MaterialUploadModal({ onClose, onSuccess }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Loans')
  const [file, setFile] = useState(null)
  const fileRef = React.useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return toast.error('Title is required')
    if (!file) return toast.error('Please select a file')
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('category', category)
      formData.append('file', file)
      await apiClient.post('/lms/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Material uploaded successfully')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📄 Upload Study Material</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label">Material Title <span className="req">*</span></div>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Home Loan KYC Checklist" />
            </div>
            <div className="form-group">
              <div className="form-label">Category</div>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {['Loans','Insurance','Sales','Compliance','HR Policies','General'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">File <span className="req">*</span></div>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: '2px dashed #e2e8f0', borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                  background: file ? '#ecfdf5' : '#f8fafc', transition: 'all 0.15s'
                }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.webm" style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                    <div style={{ fontWeight: 700, color: '#059669' }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                    <div style={{ fontWeight: 600, color: '#64748b' }}>Click to select a file</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>PDF, DOC, XLS, PPT, MP4 (max 50MB)</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ padding: 0, paddingTop: 16, border: 'none' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading...' : '⬆ Upload Material'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Quiz Builder Modal ──
function QuizBuilderModal({ courses, onClose, onSuccess }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [timeLimit, setTimeLimit] = useState(10)
  const [questions, setQuestions] = useState([{ question: '', options: { A: '', B: '', C: '', D: '' }, correct_answer: 'A' }])

  function addQuestion() {
    setQuestions([...questions, { question: '', options: { A: '', B: '', C: '', D: '' }, correct_answer: 'A' }])
  }

  function updateQuestion(idx, field, value) {
    const updated = [...questions]
    if (field.startsWith('option_')) {
      updated[idx].options[field.replace('option_', '')] = value
    } else {
      updated[idx][field] = value
    }
    setQuestions(updated)
  }

  function removeQuestion(idx) {
    if (questions.length <= 1) return toast.error('At least one question is required')
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return toast.error('Quiz title is required')
    if (questions.some(q => !q.question.trim())) return toast.error('All questions must have text')
    setSaving(true)
    try {
      await apiClient.post('/lms/quizzes', {
        title, course_id: courseId || null, passing_score: passingScore,
        time_limit_minutes: timeLimit, questions,
      })
      toast.success('Quiz created successfully')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🧠 Create Quiz</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label">Quiz Title <span className="req">*</span></div>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Home Loan KYC Quiz" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <div className="form-label">Link to Course (optional)</div>
                <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                  <option value="">None (Standalone)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <div className="form-label">Passing Score (%)</div>
                <input className="form-input" type="number" min="1" max="100" value={passingScore} onChange={e => setPassingScore(parseInt(e.target.value) || 0)} onFocus={e => e.target.select()} />
              </div>
            </div>
            <div className="form-group">
              <div className="form-label">Time Limit (minutes)</div>
              <input className="form-input" type="number" min="1" max="120" value={timeLimit} onChange={e => setTimeLimit(parseInt(e.target.value) || 0)} onFocus={e => e.target.select()} />
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Questions ({questions.length})</div>

            {questions.map((q, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>Q{idx + 1}</span>
                  <button type="button" onClick={() => removeQuestion(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Remove</button>
                </div>
                <input className="form-input" style={{ marginBottom: 10 }} value={q.question} onChange={e => updateQuestion(idx, 'question', e.target.value)} placeholder="Enter question text" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['A', 'B', 'C', 'D'].map(key => (
                    <input key={key} className="form-input" value={q.options[key]} onChange={e => updateQuestion(idx, `option_${key}`, e.target.value)} placeholder={`Option ${key}`} />
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                  <div className="form-label">Correct Answer</div>
                  <select className="form-select" value={q.correct_answer} onChange={e => updateQuestion(idx, 'correct_answer', e.target.value)}>
                    {['A', 'B', 'C', 'D'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: 16 }} onClick={addQuestion}>+ Add Question</button>

            <div className="modal-footer" style={{ padding: 0, paddingTop: 16, border: 'none' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : '✓ Create Quiz'}</button>
            </div>
          </form>
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
        office_lat: settings.office_lat || '',
        office_lng: settings.office_lng || '',
        office_radius: settings.office_radius || '500',
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
                    <h3 style={sectionTitle}>Attendance Geofencing</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Verify physical presence during check-in.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <Field label="Office Latitude" value={form.office_lat} onChange={v => setForm({...form, office_lat: v})} placeholder="Ex: 18.52" />
                        <Field label="Office Longitude" value={form.office_lng} onChange={v => setForm({...form, office_lng: v})} placeholder="Ex: 73.85" />
                    </div>
                    <Field label="Allowed Radius (Meters)" value={form.office_radius} onChange={v => setForm({...form, office_radius: v})} />
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

// ── Departments Management ────────────────────────────────────────────────────
function DepartmentsManagement() {
  const toast = useToast()
  const [depts, setDepts] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', head_user_id: '', commission_rate: '', description: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [dRes, mRes] = await Promise.all([
        apiClient.get('/admin/departments'),
        apiClient.get('/admin/users')
      ])
      setDepts(Array.isArray(dRes.data) ? dRes.data : [])
      setManagers((Array.isArray(mRes.data) ? mRes.data : []).filter(u => ['admin', 'manager'].includes(u.role)))
    } catch { toast.error('Failed to load departments') }
    finally { setLoading(false) }
  }

  function openEdit(dept) {
    setEditing(dept)
    setForm({ name: dept.name, head_user_id: dept.head_user_id || '', commission_rate: dept.commission_rate || '', description: dept.description || '' })
    setShowForm(true)
  }

  async function handleSave() {
    try {
      if (editing) {
        await apiClient.patch(`/admin/departments/${editing.id}`, form)
        toast.success('Department updated')
      } else {
        await apiClient.post('/admin/departments', form)
        toast.success('Department created')
      }
      setShowForm(false); setEditing(null); setForm({ name: '', head_user_id: '', commission_rate: '', description: '' }); fetchAll()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this department?')) return
    try { await apiClient.delete(`/admin/departments/${id}`); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading departments...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={sectionTitle}>🏬 Department Management</div>
        <button onClick={() => { setEditing(null); setForm({ name: '', head_user_id: '', commission_rate: '', description: '' }); setShowForm(true) }}
          style={{ ...btnStyle, fontSize: 13, padding: '10px 20px' }}>+ Add Department</button>
      </div>

      {/* Department Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Head</th>
              <th style={thStyle}>Commission Rate</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {depts.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No departments configured yet.</td></tr>
            ) : depts.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}><span style={{ fontWeight: 700 }}>{d.name}</span></td>
                <td style={tdStyle}>{d.head?.name || '—'}</td>
                <td style={tdStyle}>{d.commission_rate ? `${(d.commission_rate * 100).toFixed(2)}%` : '—'}</td>
                <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description || '—'}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(d)} style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
                    <button onClick={() => handleDelete(d.id)} style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#dc2626' }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 17 }}>
              {editing ? '✏️ Edit Department' : '🏬 New Department'}
            </div>
            <div style={{ padding: '18px 22px', display: 'grid', gap: 16 }}>
              <div><label style={labelStyle}>Department Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label style={labelStyle}>Department Head</label>
                <select style={inputStyle} value={form.head_user_id} onChange={e => setForm({ ...form, head_user_id: e.target.value })}>
                  <option value="">None</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Commission Rate (decimal, e.g. 0.025 = 2.5%)</label><input type="number" step="0.0001" style={inputStyle} value={form.commission_rate} onChange={e => setForm({ ...form, commission_rate: e.target.value })} /></div>
              <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ ...btnStyle, fontSize: 13, padding: '10px 20px' }}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Team Allocation Rules Management ──────────────────────────────────────────
function TeamAllocationManagement() {
  const toast = useToast()
  const [rules, setRules] = useState([])
  const [managers, setManagers] = useState([])
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', manager_id: '', department: '', role_target: 'staff', max_capacity: 10, is_active: true })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [rRes, mRes, dRes] = await Promise.all([
        apiClient.get('/admin/allocation-rules'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/departments')
      ])
      setRules(Array.isArray(rRes.data) ? rRes.data : [])
      setManagers((Array.isArray(mRes.data) ? mRes.data : []).filter(u => ['admin', 'manager'].includes(u.role)))
      setDepts(Array.isArray(dRes.data) ? dRes.data : [])
    } catch { toast.error('Failed to load allocation rules') }
    finally { setLoading(false) }
  }

  function openEdit(rule) {
    setEditing(rule)
    setForm({ name: rule.name, manager_id: rule.manager_id, department: rule.department || '', role_target: rule.role_target, max_capacity: rule.max_capacity, is_active: rule.is_active })
    setShowForm(true)
  }

  async function handleSave() {
    try {
      if (editing) {
        await apiClient.patch(`/admin/allocation-rules/${editing.id}`, form)
        toast.success('Rule updated')
      } else {
        await apiClient.post('/admin/allocation-rules', form)
        toast.success('Rule created')
      }
      setShowForm(false); setEditing(null); fetchAll()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this rule?')) return
    try { await apiClient.delete(`/admin/allocation-rules/${id}`); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  async function toggleActive(rule) {
    try {
      await apiClient.patch(`/admin/allocation-rules/${rule.id}`, { is_active: !rule.is_active })
      toast.success(rule.is_active ? 'Rule deactivated' : 'Rule activated')
      fetchAll()
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading allocation rules...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={sectionTitle}>🔀 Auto Team Allocation Rules</div>
        <button onClick={() => { setEditing(null); setForm({ name: '', manager_id: '', department: '', role_target: 'staff', max_capacity: 10, is_active: true }); setShowForm(true) }}
          style={{ ...btnStyle, fontSize: 13, padding: '10px 20px' }}>+ New Rule</button>
      </div>

      <div style={{ background: '#eff6ff', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
        💡 Rules automatically assign new staff to a manager based on department matching and remaining capacity. Each rule defines a manager, their target department, and max team size.
      </div>

      {/* Rules Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              <th style={thStyle}>Rule Name</th>
              <th style={thStyle}>Manager</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Role Target</th>
              <th style={thStyle}>Max Capacity</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No allocation rules configured. New staff will need manual manager assignment.</td></tr>
            ) : rules.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: r.is_active ? 1 : 0.5 }}>
                <td style={tdStyle}><span style={{ fontWeight: 700 }}>{r.name}</span></td>
                <td style={tdStyle}>{r.manager?.name || '—'}</td>
                <td style={tdStyle}>{r.department || 'All'}</td>
                <td style={tdStyle}><span style={badgeStyle('#eff6ff', '#2563eb')}>{r.role_target}</span></td>
                <td style={tdStyle}>{r.max_capacity}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(r.is_active ? '#dcfce7' : '#fef2f2', r.is_active ? '#166534' : '#991b1b')} onClick={() => toggleActive(r)} className="cursor-pointer">
                    {r.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(r)} style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDelete(r.id)} style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#dc2626' }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 17 }}>
              {editing ? '✏️ Edit Allocation Rule' : '🔀 New Allocation Rule'}
            </div>
            <div style={{ padding: '18px 22px', display: 'grid', gap: 16 }}>
              <div><label style={labelStyle}>Rule Name *</label><input style={inputStyle} placeholder="e.g. Sales Team A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label style={labelStyle}>Assign To Manager *</label>
                <select style={inputStyle} value={form.manager_id} onChange={e => setForm({ ...form, manager_id: e.target.value })}>
                  <option value="">Select Manager</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.emp_code})</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Department (optional — blank = all)</label>
                <select style={inputStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">All Departments</option>
                  {depts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={labelStyle}>Target Role</label>
                  <select style={inputStyle} value={form.role_target} onChange={e => setForm({ ...form, role_target: e.target.value })}>
                    <option value="staff">Staff</option>
                    <option value="dsa">DSA</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Max Capacity</label><input type="number" min="1" max="100" style={inputStyle} value={form.max_capacity} onChange={e => setForm({ ...form, max_capacity: parseInt(e.target.value) || 10 })} /></div>
              </div>
            </div>
            <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ ...btnStyle, fontSize: 13, padding: '10px 20px' }}>{editing ? 'Update Rule' : 'Create Rule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
