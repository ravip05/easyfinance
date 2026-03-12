/**
 * pages/Reports.jsx
 *
 * reports and analytics dashboard
 * lead conversion, employee productivity, revenue, branch/franchise performance
 * extensive date and category filters on all sections
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import DateRangeFilter from '../components/DateRangeFilter'

const TABS = ['Lead Conversion', 'Employee Performance', 'Revenue', 'Branch / Franchise']

export default function Reports() {
  const { user, token } = useAuth()
  const role = user?.role ?? 'staff'
  const [activeTab, setActiveTab] = useState('Lead Conversion')
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  useEffect(() => {
    fetchStats()
  }, [activeTab, dateRange])

  async function fetchStats() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.from) params.set('from', dateRange.from)
      if (dateRange.to) params.set('to', dateRange.to)
      params.set('type', activeTab.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'))

      const res = await axios.get(`/api/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(res.data.data || {})
    } catch {
      setStats({})
    }
    setIsLoading(false)
  }

  // only admin and manager can view reports
  if (!['admin', 'manager'].includes(role)) {
    return (
      <div className="empty" style={{ paddingTop: 80 }}>
        <div className="empty-icon">🔒</div>
        <div className="empty-text">Reports are available for Admins and Managers only.</div>
      </div>
    )
  }

  return (
    <div id="page-reports" className="page active">
      <div className="tabs">
        {TABS.map((t) => (
          <div key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </div>
        ))}
      </div>

      <DateRangeFilter onApply={setDateRange} />

      {/* stat cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="stat-card">
              <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 4, width: '50%', marginBottom: 10, animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ height: 24, background: 'var(--bg2)', borderRadius: 4, width: '40%', animation: 'pulse 1.5s ease infinite' }} />
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon-wrap blue">🎯</div>
              </div>
              <div className="stat-label">Total Leads</div>
              <div className="stat-value">{stats?.total_leads ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon-wrap green">✅</div>
              </div>
              <div className="stat-label">Conversions</div>
              <div className="stat-value">{stats?.conversions ?? 0}</div>
              <div className={`stat-sub ${(stats?.conversion_rate ?? 0) > 20 ? 'up' : ''}`}>
                {stats?.conversion_rate ?? 0}% rate
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon-wrap gold">💰</div>
              </div>
              <div className="stat-label">Revenue</div>
              <div className="stat-value">{stats?.revenue ?? '₹0'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon-wrap purple">👥</div>
              </div>
              <div className="stat-label">Active Employees</div>
              <div className="stat-value">{stats?.active_employees ?? 0}</div>
            </div>
          </>
        )}
      </div>

      {/* tab-specific content */}
      {activeTab === 'Lead Conversion' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Lead Conversion Breakdown</div>
          </div>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading analytics...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Count</th>
                    <th>% of Total</th>
                    <th>Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.pipeline || []).map((item) => (
                    <tr key={item.stage}>
                      <td><span className={`badge badge-${item.stage?.toLowerCase().replace(/ /g, '') || 'new'}`}>{item.stage}</span></td>
                      <td style={{ fontWeight: 700 }}>{item.count}</td>
                      <td>{item.percentage}%</td>
                      <td>
                        <div className="progress-bar" style={{ width: 100 }}>
                          <div className="progress-fill" style={{ width: `${item.percentage}%`, background: 'var(--accent)' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.pipeline || stats.pipeline.length === 0) && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>No pipeline data available for selected period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Employee Performance' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Employee Leaderboard</div>
          </div>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : (
            <div>
              {(stats?.leaderboard || []).map((emp, idx) => (
                <div key={emp.id || idx} className="dash-leader-item">
                  <div className="dash-leader-rank">{idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}</div>
                  <div className="dash-leader-bar-wrap" style={{ flex: 1 }}>
                    <div className="dash-leader-name">{emp.name}</div>
                    <div className="dash-leader-bar">
                      <div className="dash-leader-fill" style={{ width: `${emp.percentage || 0}%`, background: `linear-gradient(90deg, var(--accent), var(--purple))` }} />
                    </div>
                  </div>
                  <div className="dash-leader-val">{emp.converted || 0}</div>
                </div>
              ))}
              {(!stats?.leaderboard || stats.leaderboard.length === 0) && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>No performance data available.</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Revenue' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">💰 Revenue Report</div>
          </div>
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
            Revenue charts and breakdowns will appear here once loan disbursement data is available.
          </div>
        </div>
      )}

      {activeTab === 'Branch / Franchise' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏢 Branch & Franchise Performance</div>
          </div>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Branch / Franchise</th>
                    <th>Leads</th>
                    <th>Converted</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.branches || []).map((b) => (
                    <tr key={b.id || b.name}>
                      <td style={{ fontWeight: 600 }}>{b.name}</td>
                      <td>{b.total_leads}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 700 }}>{b.converted}</td>
                      <td>{b.rate}%</td>
                    </tr>
                  ))}
                  {(!stats?.branches || stats.branches.length === 0) && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>No branch data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
