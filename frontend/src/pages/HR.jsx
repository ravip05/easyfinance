/**
 * pages/HR.jsx
 *
 * hr module: holidays, company policies, attendance overview
 * accessible admin + manager
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

const TABS = ['Holidays', 'Policies', 'Attendance']

export default function HR() {
  const { user } = useAuth()
  const role = user?.role ?? 'staff'
  const [activeTab, setActiveTab] = useState('Holidays')
  const [holidays, setHolidays] = useState([])
  const [policies, setPolicies] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeTab === 'Holidays') fetchHolidays()
    else if (activeTab === 'Policies') fetchPolicies()
    else setIsLoading(false)
  }, [activeTab])

  async function fetchHolidays() {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/holidays')
      setHolidays(res.data.data || [])
    } catch { setHolidays([]) }
    setIsLoading(false)
  }

  async function fetchPolicies() {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/company-policies')
      setPolicies(res.data.data || [])
    } catch { setPolicies([]) }
    setIsLoading(false)
  }

  return (
    <div id="page-hr" className="page active">
      <div className="tabs">
        {TABS.map((t) => (
          <div
            key={t}
            className={`tab${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* holidays */}
      {activeTab === 'Holidays' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📅 Holiday Calendar</div>
            {role === 'admin' && (
              <button className="btn btn-primary btn-sm" id="hr-add-holiday">+ Add Holiday</button>
            )}
          </div>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : holidays.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📅</div>
              <div className="empty-text">No holidays configured yet.</div>
              {role === 'admin' && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>Click "Add Holiday" to get started.</div>}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Optional</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{h.date}</td>
                      <td>{h.title}</td>
                      <td><span className="badge badge-new">{h.type}</span></td>
                      <td>{h.is_optional ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* policies */}
      {activeTab === 'Policies' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Company Policies</div>
            {role === 'admin' && (
              <button className="btn btn-primary btn-sm" id="hr-add-policy">+ Add Policy</button>
            )}
          </div>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : policies.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No company policies published yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {policies.map((p) => (
                <div key={p.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</div>
                    <span className="badge badge-new">v{p.version || '1.0'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{p.category}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                    {p.content?.substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* attendance */}
      {activeTab === 'Attendance' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Attendance Overview</div>
          </div>
          <div className="empty">
            <div className="empty-icon">🔧</div>
            <div className="empty-text">Attendance tracking will be available in the next update.</div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
              This module will integrate with daily check-in/check-out and leave management.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
