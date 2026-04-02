import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import AnalyticsFunnelChart from '../components/AnalyticsFunnelChart'
import RevenueGrowthChart from '../components/RevenueGrowthChart'

const TABS = [
  { id: 'leads', label: 'Lead Conversion', icon: '🎯' },
  { id: 'performance', label: 'Team Ranking', icon: '🏆' },
  { id: 'revenue', label: 'Revenue Trends', icon: '📈' },
  { id: 'branches', label: 'Branch Reports', icon: '🏢' },
]

export default function Reports() {
  const { user } = useAuth()
  const role = user?.role ?? 'staff'
  const [activeTab, setActiveTab] = useState('leads')
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [stats, setStats] = useState({
      summary: {},
      by_stage: [],
      leaderboard: [],
      trends: [],
      branches: []
  })

  useEffect(() => {
    fetchStats()
  }, [activeTab, dateFrom, dateTo])

  async function fetchStats() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const qs = params.toString() ? `?${params}` : ''
      const [sRes, lRes, rRes, bRes] = await Promise.all([
        apiClient.get(`/reports/summary${qs}`),
        apiClient.get(`/reports/leads${qs}`),
        apiClient.get(`/reports/revenue-trends${qs}`),
        apiClient.get(`/reports/branch-performance${qs}`)
      ])
      
      setStats({
          summary: sRes.data?.data || {},
          by_stage: lRes.data?.data?.by_stage || [],
          leaderboard: lRes.data?.data?.leaderboard || [],
          trends: rRes.data?.data || [],
          branches: bRes.data?.data || []
      })
    } catch (err) {
      console.error('Failed to load reports', err)
    } finally {
      setLoading(false)
    }
  }

  if (!['admin', 'manager'].includes(role)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <div style={{ fontWeight: 800 }}>Restricted Access</div>
        <p style={{ fontSize: '14px' }}>Reports are only accessible to Administrators and Managers.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>Analytics & Intelligence</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time insights across your lead pipeline and branch performance.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 600 }} />
          <span style={{ color: '#94a3b8', fontWeight: 700 }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 600 }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕ Clear</button>
          )}
          <button onClick={() => {
            const rows = ['Metric,Value', `Conversion Rate,${stats.summary.conversion_rate || 0}%`, `Revenue,${stats.summary.revenue || 0}`, `Total Leads,${stats.summary.total_leads || 0}`, `Conversions,${stats.summary.conversions || 0}`]
            stats.by_stage.forEach(s => rows.push(`Stage: ${s.stage},${s.count}`))
            stats.branches.forEach(b => rows.push(`Branch: ${b.name},Leads: ${b.total_leads} Converted: ${b.converted}`))
            const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analytics_report.csv'; a.click()
          }} style={{ padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.2)' }}>📊 Export CSV</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KPICard label="Lead Conversion" value={`${stats.summary.conversion_rate || 0}%`} sub={`${stats.summary.conversions || 0} Successful`} color="#2563eb" />
        <KPICard label="Avg. TAT (days)" value={stats.summary.avg_tat || '0'} sub="Sanction Time" color="#8b5cf6" />
        <KPICard label="Total Revenue" value={stats.summary.revenue || '₹0'} sub="Disbursed Amount" color="#10b981" />
        <KPICard label="Active Pipeline" value={stats.summary.total_leads || 0} sub="Managed Leads" color="#f59e0b" />
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1.5px solid #e2e8f0', marginBottom: '32px', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 0 16px', border: 'none', background: 'transparent',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              borderBottom: activeTab === tab.id ? '2.5px solid #2563eb' : '2.5px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Report Area */}
      <div style={{ minHeight: '500px' }}>
        {activeTab === 'leads' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
             <ReportCard title="Pipeline Conversion Funnel">
                <AnalyticsFunnelChart data={stats.by_stage} />
             </ReportCard>
             <ReportCard title="Lead Source Weightage">
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {/* Simulating Pie Chart */}
                   <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', background: 'conic-gradient(#2563eb 0% 45%, #8b5cf6 45% 75%, #10b981 75% 90%, #f59e0b 90% 100%)' }}>
                       <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e293b' }}>Direct (45%)</div>
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                    <LegendItem dot="#2563eb" label="Direct Ads" />
                    <LegendItem dot="#8b5cf6" label="DSAs" />
                    <LegendItem dot="#10b981" label="Referrals" />
                    <LegendItem dot="#f59e0b" label="Social" />
                </div>
             </ReportCard>
          </div>
        )}

        {activeTab === 'performance' && (
           <ReportCard title="Staff Efficiency Leaderboard">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                         <th style={thStyle}>Rank</th>
                         <th style={thStyle}>Employee</th>
                         <th style={thStyle}>Converted</th>
                         <th style={thStyle}>Target Achieved</th>
                      </tr>
                   </thead>
                   <tbody>
                      {[
                        { r: '🥇', n: 'Amit Sharma', c: 24, p: 92 },
                        { r: '🥈', n: 'Priya Patel', c: 19, p: 85 },
                        { r: '🥉', n: 'Rahul Singh', c: 15, p: 78 },
                        { r: '#4', n: 'Sanjay Gupta', c: 12, p: 60 }
                      ].map((u, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                           <td style={tdStyle}>{u.r}</td>
                           <td style={tdStyle}><span style={{ fontWeight: 700 }}>{u.n}</span></td>
                           <td style={tdStyle}>{u.c} Leads</td>
                           <td style={tdStyle}>
                              <div style={{ width: '100px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ width: `${u.p}%`, height: '100%', background: '#2563eb' }} />
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
           </ReportCard>
        )}

        {activeTab === 'revenue' && (
           <ReportCard title="Monthly Disbursement Trends (INR)">
               <div style={{ padding: '20px 0' }}>
                  <RevenueGrowthChart data={stats.trends} />
               </div>
           </ReportCard>
        )}

        {activeTab === 'branches' && (
           <ReportCard title="Franchise & Branch Performance Matrix">
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                         <th style={thStyle}>Branch Name</th>
                         <th style={thStyle}>Total Leads</th>
                         <th style={thStyle}>Converted</th>
                         <th style={thStyle}>Conversion Rate</th>
                      </tr>
                   </thead>
                   <tbody>
                      {stats.branches.map((b, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                           <td style={tdStyle}><span style={{ fontWeight: 700 }}>{b.name}</span></td>
                           <td style={tdStyle}>{b.total_leads}</td>
                           <td style={tdStyle}><span style={{ color: '#10b981', fontWeight: 800 }}>{b.converted}</span></td>
                           <td style={tdStyle}><span style={badgeStyle('#eff6ff', '#2563eb')}>{b.rate}%</span></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
           </ReportCard>
        )}
      </div>
    </div>
  )
}

// ── Shared UI Elements ────────────────────────────────────────────────────────

function KPICard({ label, value, sub, color }) {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color }}>{sub}</div>
        </div>
    )
}

function ReportCard({ title, children }) {
    return (
        <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 32px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #2563eb', paddingLeft: '16px' }}>{title}</h3>
            {children}
        </div>
    )
}

function LegendItem({ dot, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot }} />
            {label}
        </div>
    )
}

const thStyle = { padding: '16px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }
const tdStyle = { padding: '24px 12px', fontSize: '14px', color: '#1e293b' }
const badgeStyle = (bg, f) => ({ padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 900, background: bg, color: f, letterSpacing: '0.05em' })
