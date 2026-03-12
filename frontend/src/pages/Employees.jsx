/**
 * pages/Employees.jsx
 *
 * employee management page with CRUD, search, status toggling, and detail panel
 * accessible to admin and manager roles only
 * admin: full CRUD + status toggle
 * manager: view own team only
 */
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import axios from 'axios'

const ROLES = ['admin', 'manager', 'staff']
const STATUSES = ['Active', 'On Leave', 'Inactive']
const STATUS_BADGE = { Active: 'badge-active', 'On Leave': 'badge-med', Inactive: 'badge-inactive' }
const ROLE_BADGE = { admin: 'badge-high', manager: 'badge-new', staff: 'badge-contacted' }

export default function Employees() {
  const { user, token } = useAuth()
  const toast = useToast()
  const role = user?.role ?? 'staff'
  const isAdmin = role === 'admin'

  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // fetch employees
  async function fetchEmployees() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await axios.get(`/api/employees?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployees(res.data.data || [])
    } catch (e) {
      toast?.('error', 'Failed to load employees')
    }
    setIsLoading(false)
  }

  useEffect(() => { fetchEmployees() }, [search, roleFilter, statusFilter])

  // status toggle
  async function handleStatusChange(emp, newStatus) {
    try {
      await axios.patch(`/api/employees/${emp.id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast?.('success', `${emp.name} set to ${newStatus}`)
      fetchEmployees()
    } catch (e) {
      toast?.('error', 'Failed to update status')
    }
  }

  // delete
  async function handleDeactivate(emp) {
    if (!window.confirm(`Deactivate "${emp.name}"? Their leads will be preserved.`)) return
    try {
      await axios.delete(`/api/employees/${emp.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast?.('success', `${emp.name} deactivated`)
      fetchEmployees()
    } catch (e) {
      toast?.('error', e.response?.data?.message || 'Failed')
    }
  }

  // guard
  if (!['admin', 'manager'].includes(role)) {
    return (
      <div className="empty" style={{ paddingTop: 80 }}>
        <div className="empty-icon">🔒</div>
        <div className="empty-text">Access restricted to Admins and Managers.</div>
      </div>
    )
  }

  return (
    <div id="page-employees" className="page active">
      {/* filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <input
            className="form-input"
            placeholder="Search name, email, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="emp-search"
          />
        </div>
        <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} id="emp-add-btn">
            + Add Employee
          </button>
        )}
      </div>

      {/* employee cards grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {isLoading && Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card" style={{ minHeight: 140 }}>
            <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 4, width: '60%', marginBottom: 10, animation: 'pulse 1.5s ease infinite' }} />
            <div style={{ height: 10, background: 'var(--bg2)', borderRadius: 4, width: '80%', animation: 'pulse 1.5s ease infinite' }} />
          </div>
        ))}

        {!isLoading && employees.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
            <div style={{ color: 'var(--text3)' }}>No employees found.</div>
          </div>
        )}

        {!isLoading && employees.map((emp) => (
          <div key={emp.id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setSelected(emp)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                {emp.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {emp.emp_code} · {emp.department || 'General'}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[emp.status] || 'badge-new'}`}>{emp.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className={`badge ${ROLE_BADGE[emp.role] || 'badge-new'}`}>{emp.role}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>📞 {emp.phone}</span>
              {emp.commission_display && emp.commission_display !== '—' && (
                <span style={{ fontSize: 11, color: 'var(--green)' }}>💰 {emp.commission_display}</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text2)' }}>
                Leads: <strong>{emp.total_leads ?? 0}</strong>
              </span>
              <span style={{ color: 'var(--green)' }}>
                Converted: <strong>{emp.converted_leads ?? 0}</strong>
              </span>
              {emp.team_leader && (
                <span style={{ color: 'var(--text3)', fontSize: 10 }}>
                  Under: {emp.team_leader.name}
                </span>
              )}
            </div>

            {/* admin actions */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: 4, marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <select
                  className="form-select"
                  value={emp.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); handleStatusChange(emp, e.target.value) }}
                  style={{ flex: 1, fontSize: 11, padding: '4px 8px' }}
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--red)' }}
                  onClick={(e) => { e.stopPropagation(); handleDeactivate(emp) }}
                  title="Deactivate"
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* detail side panel */}
      {selected && (
        <div className="modal-overlay open" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">👤 {selected.name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-hd" style={{ marginBottom: 16 }}>
                <div className="profile-av">{selected.initials}</div>
                <div>
                  <div className="profile-name">{selected.name}</div>
                  <div className="profile-meta">{selected.emp_code} · {selected.role} · {selected.department || 'General'}</div>
                </div>
              </div>
              <div className="kpi-row">
                <div className="kpi"><div className="kpi-val">{selected.total_leads ?? 0}</div><div className="kpi-lbl">Total Leads</div></div>
                <div className="kpi"><div className="kpi-val">{selected.converted_leads ?? 0}</div><div className="kpi-lbl">Converted</div></div>
                <div className="kpi"><div className="kpi-val">{selected.commission_display || '—'}</div><div className="kpi-lbl">Commission</div></div>
              </div>
              <table style={{ width: '100%', fontSize: 12 }}>
                <tbody>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Email</td><td style={{ fontWeight: 600 }}>{selected.email}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Phone</td><td style={{ fontWeight: 600 }}>{selected.phone}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Status</td><td><span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status}</span></td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Joined</td><td>{selected.joining_date || '—'}</td></tr>
                  {selected.team_leader && (
                    <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Reports To</td><td>{selected.team_leader.name} ({selected.team_leader.emp_code})</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
