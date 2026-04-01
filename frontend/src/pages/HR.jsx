import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { hrApi } from '../api/hr'
import HolidayModal from '../components/HolidayModal'
import PolicyModal from '../components/PolicyModal'

export default function HR() {
  const { user } = useAuth()
  const toast = useToast()
  const role = user?.role ?? 'staff'
  
  const [activeTab, setActiveTab] = useState('attendance')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ holidays: [], policies: [], attendance: [], summary: {}, leaves: [], payouts: [] })
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const tabs = [
    { id: 'attendance', label: 'My Attendance', icon: '📅' },
    { id: 'holidays', label: 'Holidays', icon: '🎉' },
    { id: 'leaves', label: 'Leave Requests', icon: '✈️' },
    { id: 'payouts', label: 'Payout History', icon: '💸' },
    { id: 'policies', label: 'Company Policies', icon: '📋' },
  ]

  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      if (activeTab === 'attendance') {
        const [aRes, sRes] = await Promise.all([
          hrApi.getAttendance(),
          hrApi.getAttendanceSummary()
        ])
        setData(prev => ({ ...prev, attendance: aRes.data.data || [], summary: sRes.data.data || {} }))
      } else if (activeTab === 'holidays') {
        const res = await hrApi.listHolidays()
        setData(prev => ({ ...prev, holidays: res.data.data || [] }))
      } else if (activeTab === 'policies') {
        const res = await hrApi.listPolicies()
        setData(prev => ({ ...prev, policies: res.data.data || [] }))
      } else if (activeTab === 'leaves') {
        const res = await hrApi.listLeaves()
        setData(prev => ({ ...prev, leaves: res.data.data || [] }))
      } else if (activeTab === 'payouts') {
        try {
          const res = await hrApi.getStaffPayouts()
          setData(prev => ({ ...prev, payouts: res.data.data || [] }))
        } catch { setData(prev => ({ ...prev, payouts: [] })) }
      }
    } catch (err) {
      // silent fallback
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteHoliday(id) {
    if (!window.confirm('Delete this holiday?')) return
    try {
      await hrApi.deleteHoliday(id)
      toast.success('Holiday deleted')
      fetchData()
    } catch { toast.error('Failed to delete holiday') }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>HR & Operations</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Manage attendance, leaves, holidays, payroll, and company policies.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             {activeTab === 'leaves' && (
                <button onClick={() => setShowLeaveModal(true)} style={btnPrimary}>+ Apply for Leave</button>
             )}
             {role === 'admin' && activeTab === 'holidays' && (
                <button onClick={() => setShowHolidayModal(true)} style={btnSecondary}>+ Add Holiday</button>
             )}
              {role === 'admin' && activeTab === 'policies' && (
                <button onClick={() => setShowPolicyModal(true)} style={btnSecondary}>+ Publish Policy</button>
             )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1.5px solid #e2e8f0', marginBottom: '32px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 0 16px', border: 'none', background: 'transparent',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'attendance' && <AttendanceView data={data.attendance} summary={data.summary} loading={loading} />}
        {activeTab === 'holidays' && <HolidaysView data={data.holidays} loading={loading} isAdmin={role === 'admin'} onDelete={handleDeleteHoliday} />}
        {activeTab === 'leaves' && <LeavesView data={data.leaves} loading={loading} role={role} onRefresh={fetchData} />}
        {activeTab === 'payouts' && <PayoutsView data={data.payouts} loading={loading} />}
        {activeTab === 'policies' && <PoliciesView data={data.policies} loading={loading} />}
      </div>

      <HolidayModal isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} onSuccess={fetchData} />
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} onSuccess={fetchData} />
      {showLeaveModal && <LeaveApplyModal onClose={() => setShowLeaveModal(false)} onSuccess={() => { setShowLeaveModal(false); fetchData() }} />}
    </div>
  )
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function AttendanceView({ data, summary, loading }) {
    if (loading) return <Loader />
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '8px' }}>
                <StatCard label="Present" value={summary?.present || 0} color="#10b981" />
                <StatCard label="Late" value={summary?.late || 0} color="#f59e0b" />
                <StatCard label="On Leave" value={summary?.['on-leave'] || 0} color="#3b82f6" />
                <StatCard label="Absent" value={summary?.absent || 0} color="#ef4444" />
            </div>
            <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800 }}>Check-in History</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Check In</th>
                                <th style={thStyle}>Check Out</th>
                                <th style={thStyle}>Total Hours</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!Array.isArray(data) || data.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found for this period.</td></tr>
                            ) : data.map(record => (
                                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>{record.check_in_at ? new Date(record.check_in_at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : 'N/A'}</td>
                                    <td style={tdStyle}>{record.check_in_at ? new Date(record.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                                    <td style={tdStyle}>{record.check_out_at ? new Date(record.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                                    <td style={tdStyle}>8h 30m</td>
                                    <td style={tdStyle}><span style={badgeStyle(record.status === 'present' ? '#dcfce7' : '#fee2e2', record.status === 'present' ? '#166534' : '#991b1b')}>{record.status?.toUpperCase() || 'UNKNOWN'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function HolidaysView({ data, loading, isAdmin, onDelete }) {
    if (loading) return <Loader />

    const today = new Date().toISOString().split('T')[0]
    const upcoming = data.filter(h => h.date >= today)
    const past = data.filter(h => h.date < today)

    const renderCard = (h) => (
        <div key={h.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎊</div>
            <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{h.title}</div>
            <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: 700, marginBottom: '8px' }}>{new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={badgeStyle(h.type === 'national' ? '#eff6ff' : '#fef3c7', h.type === 'national' ? '#2563eb' : '#92400e')}>{h.type || 'Company'}</span>
              {h.is_optional && <span style={badgeStyle('#f1f5f9', '#475569')}>Optional</span>}
            </div>
            {isAdmin && (
              <button onClick={() => onDelete(h.id)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, fontWeight: 800 }}>✕</button>
            )}
        </div>
    )

    return (
        <div>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, borderLeft: '4px solid #10b981', paddingLeft: 12 }}>Upcoming Holidays ({upcoming.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {upcoming.map(renderCard)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, borderLeft: '4px solid #94a3b8', paddingLeft: 12 }}>Past Holidays ({past.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', opacity: 0.7 }}>
                {past.map(renderCard)}
              </div>
            </div>
          )}
          {data.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <div style={{ fontWeight: 700 }}>No holidays configured yet.</div>
            </div>
          )}
        </div>
    )
}

// ── Leave Management View ─────────────────────────────────────────────────────

function LeavesView({ data, loading, role, onRefresh }) {
    const toast = useToast()
    const isAdminOrManager = ['admin', 'manager'].includes(role)
    const [actionLoading, setActionLoading] = useState(null)

    async function handleAction(leaveId, status, rejectionNote = '') {
      setActionLoading(leaveId)
      try {
        await hrApi.updateLeave(leaveId, { status, rejection_note: rejectionNote })
        toast.success(`Leave ${status.toLowerCase()}`)
        onRefresh()
      } catch (e) {
        toast.error(e.response?.data?.message || 'Action failed')
      } finally {
        setActionLoading(null)
      }
    }

    if (loading) return <Loader />

    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>No leave requests yet.</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>Click "Apply for Leave" to submit your first request.</div>
        </div>
      )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.map(leave => (
            <div key={leave.id} style={{ background: 'white', borderRadius: '18px', border: '1.5px solid #e2e8f0', padding: '20px 24px', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {isAdminOrManager && leave.user && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                      <strong>{leave.user.name}</strong> ({leave.user.emp_code}) · {leave.user.department || 'General'}
                    </div>
                  )}
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{leave.type}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    {new Date(leave.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    {' → '}
                    {new Date(leave.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span style={{ color: '#94a3b8', marginLeft: 8 }}>({leave.days} day{leave.days > 1 ? 's' : ''})</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{leave.reason}</div>
                  {leave.rejection_note && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, padding: '6px 10px', background: '#fef2f2', borderRadius: 8 }}>
                      Rejection Note: {leave.rejection_note}
                    </div>
                  )}
                  {leave.approved_by && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Reviewed by {leave.approved_by}</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={badgeStyle(
                    leave.status === 'Approved' ? '#dcfce7' : leave.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                    leave.status === 'Approved' ? '#166534' : leave.status === 'Rejected' ? '#991b1b' : '#92400e'
                  )}>
                    {leave.status === 'Approved' ? '✅' : leave.status === 'Rejected' ? '❌' : '⏳'} {leave.status}
                  </span>

                  {isAdminOrManager && leave.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        disabled={actionLoading === leave.id}
                        onClick={() => handleAction(leave.id, 'Approved')}
                        style={{ ...btnSmall, background: '#10b981', color: 'white' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        disabled={actionLoading === leave.id}
                        onClick={() => {
                          const note = window.prompt('Rejection reason (optional):')
                          if (note !== null) handleAction(leave.id, 'Rejected', note)
                        }}
                        style={{ ...btnSmall, background: '#ef4444', color: 'white' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    )
}

// ── Leave Apply Modal ─────────────────────────────────────────────────────────

function LeaveApplyModal({ onClose, onSuccess }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: 'Casual Leave',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  })

  const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave', 'Other']

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.reason.trim()) return toast.error('Please provide a reason')
    if (form.end_date < form.start_date) return toast.error('End date cannot be before start date')

    setSaving(true)
    try {
      await hrApi.applyLeave(form)
      toast.success('Leave request submitted!')
      onSuccess()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit leave')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">✈️ Apply for Leave</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <div className="form-label">Leave Type <span className="req">*</span></div>
              <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <div className="form-label">Start Date <span className="req">*</span></div>
                <input className="form-input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <div className="form-label">End Date <span className="req">*</span></div>
                <input className="form-input" type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <div className="form-label">Reason <span className="req">*</span></div>
              <textarea className="form-input" rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Describe why you need this leave..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : '✓ Submit Request'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PayoutsView({ data, loading }) {
    if (loading) return <Loader />

    if (!data || data.length === 0) {
      return (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px' }}>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💸</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>No Payout Records</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '12px auto' }}>Your payout history will appear here once payroll is processed for your account.</p>
          </div>
        </div>
      )
    }

    return (
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800 }}>Payout Ledger</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={thStyle}>Period</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Commission</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Paid On</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{p.period || p.month || 'N/A'}</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                  <td style={tdStyle}>₹{Number(p.commission || 0).toLocaleString('en-IN')}</td>
                  <td style={tdStyle}><span style={badgeStyle(p.status === 'Paid' ? '#dcfce7' : '#fef3c7', p.status === 'Paid' ? '#166534' : '#92400e')}>{p.status || 'Pending'}</span></td>
                  <td style={tdStyle}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
}

function PoliciesView({ data, loading }) {
    if (loading) return <Loader />
    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700 }}>No policies published yet.</div>
        </div>
      )
    }
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {data.map(p => (
                <div key={p.id} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '24px', transition: 'all 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', marginTop: '6px' }} />
                        <span style={badgeStyle('#eff6ff', '#2563eb')}>v{p.version || '1.0'}</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{p.title}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>{p.content?.substring(0, 150)}...</p>
                    <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'transparent', color: '#1e293b', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Read Full Policy</button>
                </div>
            ))}
        </div>
    )
}

// ── Shared UI Elements ────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', borderLeft: `5px solid ${color}` }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>{value}</div>
        </div>
    )
}

function Loader() {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Synchronizing data...</div>
}

const btnPrimary = {
  background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', border: 'none',
  padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
}
const btnSecondary = {
  background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
  padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
}
const btnSmall = {
  border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700,
  fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s'
}

const thStyle = { padding: '16px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }
const tdStyle = { padding: '20px 12px', fontSize: '14px', color: '#1e293b' }
const badgeStyle = (bg, f) => ({ padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, background: bg, color: f, letterSpacing: '0.025em' })
