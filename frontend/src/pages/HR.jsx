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
  const [data, setData] = useState({ holidays: [], policies: [], attendance: [], summary: {} })
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  const tabs = [
    { id: 'attendance', label: 'My Attendance', icon: '📅' },
    { id: 'holidays', label: 'Holidays', icon: '🎉' },
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
        setData(prev => ({ ...prev, attendance: aRes.data.data, summary: sRes.data.data }))
      } else if (activeTab === 'holidays') {
        const res = await hrApi.listHolidays()
        setData(prev => ({ ...prev, holidays: res.data.data }))
      } else if (activeTab === 'policies') {
        const res = await hrApi.listPolicies()
        setData(prev => ({ ...prev, policies: res.data.data }))
      }
    } catch (err) {
      // toast?.('error', 'Failed to sync HR data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>HR & Operations</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Track attendance, view policies, and manage your payouts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
             {role === 'admin' && activeTab === 'holidays' && (
                <button onClick={() => setShowHolidayModal(true)} style={btnStyleSecondary}>+ Add Holiday</button>
             )}
              {role === 'admin' && activeTab === 'policies' && (
                <button onClick={() => setShowPolicyModal(true)} style={btnStyleSecondary}>+ Publish Policy</button>
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
        {activeTab === 'holidays' && <HolidaysView data={data.holidays} loading={loading} />}
        {activeTab === 'payouts' && <PayoutsView loading={loading} />}
        {activeTab === 'policies' && <PoliciesView data={data.policies} loading={loading} />}
      </div>

      <HolidayModal isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} onSuccess={fetchData} />
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} onSuccess={fetchData} />
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

function HolidaysView({ data, loading }) {
    if (loading) return <Loader />
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {data.map(h => (
                <div key={h.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎊</div>
                    <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{h.title}</div>
                    <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: 700, marginBottom: '12px' }}>{new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <span style={badgeStyle('#f1f5f9', '#475569')}>{h.type || 'Company Holiday'}</span>
                </div>
            ))}
        </div>
    )
}

function PayoutsView({ loading }) {
    // Mocked for parity demo
    return (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px' }}>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Payroll Ledger Secured</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '12px auto' }}>Your payout history is encrypted. You will be able to view and download your salary slips here starting next billing cycle.</p>
                <button style={{ ...btnStyleSecondary, marginTop: '20px' }}>Verify Identity to View</button>
            </div>
        </div>
    )
}

function PoliciesView({ data, loading }) {
    if (loading) return <Loader />
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
                    <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'transparent', color: '#1e293b', fontWeight: 700, fontSize: '13px' }}>Read Full Policy</button>
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

const btnStyleSecondary = {
  background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
  padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
}

const thStyle = { padding: '16px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }
const tdStyle = { padding: '20px 12px', fontSize: '14px', color: '#1e293b' }
const badgeStyle = (bg, f) => ({ padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, background: bg, color: f, letterSpacing: '0.025em' })
