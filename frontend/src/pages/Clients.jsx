/**
 * pages/Clients.jsx
 *
 * Displays the converted Clients table.
 * Consumes GET /api/clients.
 */
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

const STAGES = ['Docs Pending', 'Login', 'Processing', 'Sanctioned', 'Disbursed', 'Closed']
const LOAN_TYPES = ['Home Loan', 'Business Loan', 'Personal Loan', 'Car Loan', 'LAP', 'Insurance']

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState('')
  const [stageFil, setStageFil] = useState('')
  const [typeFil, setTypeFil] = useState('')

  const role = user?.role ?? 'staff'
  const canEdit = ['admin', 'manager'].includes(role)
  const canDelete = role === 'admin'

  useEffect(() => {
    fetchClients()
  }, [stageFil, typeFil])

  async function fetchClients() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (stageFil) params.append('stage', stageFil)
      if (typeFil)  params.append('loan_type', typeFil)
      
      const { data } = await apiClient.get(`/clients?${params.toString()}`)
      setClients(data.data ?? [])
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = clients
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c => 
        (c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.pan_number?.toLowerCase().includes(q))
      )
    }
    return list
  }, [clients, search])

  return (
    <div className="page active" style={{ padding: '0 16px 24px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text, #0f172a)' }}>Client Profiles</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text2, #64748b)' }}>
            Manage successfully converted leads and their loan processing.
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <input
            className="form-input"
            placeholder="Search by name, phone or PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: 48, borderRadius: 8, border: '1.5px solid var(--border, #e2e8f0)', padding: '0 12px' }}
          />
        </div>
        <select 
          className="form-select" 
          value={stageFil} 
          onChange={(e) => setStageFil(e.target.value)}
          style={{ width: 'auto', height: 48, borderRadius: 8, border: '1.5px solid var(--border, #e2e8f0)', padding: '0 12px' }}
        >
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select 
          className="form-select" 
          value={typeFil} 
          onChange={(e) => setTypeFil(e.target.value)}
          style={{ width: 'auto', height: 48, borderRadius: 8, border: '1.5px solid var(--border, #e2e8f0)', padding: '0 12px' }}
        >
          <option value="">All Loan Types</option>
          {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Loan Details</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Bank / CIBIL</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Stage</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    Loading clients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>No clients found</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Try adjusting your filters or search query.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {client.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{client.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{client.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{client.loan_type}</div>
                      <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>{client.amount_display}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {client.bank_policy ? (
                            <span style={{ 
                              padding: '2px 8px', borderRadius: 4, background: client.bank_policy.brand_color + '15', 
                              color: client.bank_policy.brand_color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {client.bank_policy.name}
                            </span>
                          ) : '—'}
                       </div>
                       <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>CIBIL:</span>
                          <span style={{ 
                            fontSize: 12, fontWeight: 700,
                            color: client.cibil_score >= 750 ? '#16a34a' : client.cibil_score >= 650 ? '#d97706' : '#dc2626'
                          }}>
                            {client.cibil_score || 'N/A'}
                          </span>
                       </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge badge-${client.stage?.toLowerCase().replace(' ', '-')}`} style={{ 
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 
                      }}>
                        {client.stage}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-xs" title="View details">👁</button>
                        {canEdit && <button className="btn btn-ghost btn-xs" title="Edit client">✏️</button>}
                        {canDelete && <button className="btn btn-ghost btn-xs" title="Archive" style={{ color: '#dc2626' }}>🗑</button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .badge-docs-pending { background: #fef3c7; color: #92400e; }
        .badge-login { background: #dcfce7; color: #166534; }
        .badge-processing { background: #e0f2fe; color: #075985; }
        .badge-sanctioned { background: #f3e8ff; color: #6b21a8; }
        .badge-disbursed { background: #f0f9ff; color: #1e40af; }
        .badge-closed { background: #f1f5f9; color: #475569; }
        .crm-table tr:hover { background-color: #f8fafc; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  )
}
