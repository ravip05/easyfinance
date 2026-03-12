/**
 * pages/Franchise.jsx
 *
 * franchise management page
 * admin: sees all franchises with performance stats
 * dsa: sees own franchise dashboard (same as manager)
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import apiClient from '../api/client'
import FranchiseModal from '../components/FranchiseModal'

export default function Franchise() {
  const { user } = useAuth()
  const toast = useToast()
  const role = user?.role ?? 'staff'
  const [franchises, setFranchises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchFranchises()
  }, [])

  async function fetchFranchises() {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/franchises')
      setFranchises(res.data.data || [])
    } catch (e) {
      toast?.('error', 'Failed to load franchises')
      setFranchises([])
    }
    setIsLoading(false)
  }

  const networkStats = franchises.reduce((acc, fr) => ({
    totalLeads: acc.totalLeads + (fr.total_leads || 0),
    converted: acc.converted + (fr.converted_leads || 0),
    revenue: acc.revenue + (parseInt(fr.revenue?.replace(/[^0-9]/g, '') || 0))
  }), { totalLeads: 0, converted: 0, revenue: 0 })

  return (
    <div id="page-franchise" className="page active">
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700 }}>
            🤝 Franchise Network
          </span>
        </div>
        {role === 'admin' && (
          <button 
            className="btn btn-primary btn-sm" 
            id="fr-add-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Franchise
          </button>
        )}
      </div>

      {!isLoading && franchises.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Total Network Leads</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{networkStats.totalLeads}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Conversions</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{networkStats.converted}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Network Revenue</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>₹{new Intl.NumberFormat('en-IN').format(networkStats.revenue)}</div>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {isLoading && Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="fr-card" style={{ minHeight: 180 }}>
            <div style={{ height: 16, background: 'var(--bg2)', borderRadius: 4, width: '50%', marginBottom: 12, animation: 'pulse 1.5s ease infinite' }} />
            <div style={{ height: 10, background: 'var(--bg2)', borderRadius: 4, width: '80%', animation: 'pulse 1.5s ease infinite' }} />
          </div>
        ))}

        {!isLoading && franchises.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
            <div style={{ color: 'var(--text3)' }}>No franchises found.</div>
          </div>
        )}

        {!isLoading && franchises.map((fr) => (
          <div key={fr.id} className="fr-card" onClick={() => setSelected(fr)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="user-avatar" style={{ width: 42, height: 42, fontSize: 14, background: 'linear-gradient(135deg, var(--gold), var(--orange))' }}>
                {fr.code?.substring(0, 2) || 'FR'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{fr.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {fr.code} · {fr.city || 'Location TBD'}
                </div>
              </div>
              <span className={`badge ${fr.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                {fr.status || 'Active'}
              </span>
            </div>

            {fr.owner_name && (
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                👤 Owner: <strong>{fr.owner_name}</strong>
              </div>
            )}

            <div className="fr-stats">
              <div>
                <div className="fr-stat-val" style={{ color: 'var(--accent)' }}>{fr.total_leads ?? 0}</div>
                <div className="fr-stat-lbl">Leads</div>
              </div>
              <div>
                <div className="fr-stat-val" style={{ color: 'var(--green)' }}>{fr.converted ?? 0}</div>
                <div className="fr-stat-lbl">Converted</div>
              </div>
              <div>
                <div className="fr-stat-val" style={{ color: 'var(--gold)' }}>{fr.revenue || '₹0'}</div>
                <div className="fr-stat-lbl">Revenue</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* detail modal */}
      {selected && (
        <div className="modal-overlay open" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🤝 {selected.name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="kpi-row">
                <div className="kpi"><div className="kpi-val">{selected.total_leads ?? 0}</div><div className="kpi-lbl">Total Leads</div></div>
                <div className="kpi"><div className="kpi-val">{selected.converted ?? 0}</div><div className="kpi-lbl">Converted</div></div>
                <div className="kpi"><div className="kpi-val">{selected.members_count ?? 0}</div><div className="kpi-lbl">Members</div></div>
              </div>
              <table style={{ width: '100%', fontSize: 12 }}>
                <tbody>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Code</td><td style={{ fontWeight: 600 }}>{selected.code}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Owner</td><td>{selected.owner_name || '—'}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>City</td><td>{selected.city || '—'}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Phone</td><td>{selected.phone || '—'}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Email</td><td>{selected.email || '—'}</td></tr>
                  <tr><td style={{ color: 'var(--text3)', padding: '6px 0' }}>Commission</td><td>{selected.commission_rate || '—'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* add franchise modal */}
      <FranchiseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchFranchises}
      />
    </div>
  )
}
