/**
 * pages/Franchise.jsx
 *
 * franchise management page
 * admin: sees all franchises with performance stats
 * dsa: sees own franchise dashboard (same as manager)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import apiClient from '../api/client'
import FranchiseModal from '../components/FranchiseModal'

export default function Franchise() {
  const { user, impersonate } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const role = user?.role ?? 'staff'
  const [franchises, setFranchises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFranchise, setEditingFranchise] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('info')
  const [detailData, setDetailData] = useState({ leads: [], clients: [] })
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [impersonatingId, setImpersonatingId] = useState(null)

  useEffect(() => {
    fetchFranchises()
  }, [])

  async function fetchFranchises() {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/franchises')
      setFranchises(res.data.data || [])
    } catch (e) {
      toast.error('Failed to load franchises')
      setFranchises([])
    }
    setIsLoading(false)
  }

  async function handleDelete(fr) {
    if (!window.confirm(`Delete franchise "${fr.name}"?`)) return
    try {
      await apiClient.delete(`/franchises/${fr.id}`)
      toast.success(`Franchise deleted`)
      fetchFranchises()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete franchise')
    }
  }

  async function handleView(fr) {
    setSelected(fr)
    setIsDetailsLoading(true)
    setActiveDetailTab('info')
    try {
      const [details, business] = await Promise.all([
        apiClient.get(`/franchises/${fr.id}`),
        apiClient.get(`/franchises/${fr.id}/leads`)
      ])
      // Safeguard: Only update if the user hasn't closed the modal or switched to another franchise
      const fullData = details.data.data
      setSelected(prev => (prev && prev.id === fr.id) ? fullData : prev)
      setDetailData({ 
        leads: (business.data.data || []).filter(l => l.stage !== 'Disbursed'),
        clients: (business.data.data || []).filter(l => l.stage === 'Disbursed')
      })
    } catch (e) {
      toast.error('Failed to fetch franchise details')
    } finally {
      setIsDetailsLoading(false)
    }
  }

  async function handleLoginAs(userId) {
    // If double-clicked or already in progress, ignore
    if (impersonatingId) return;

    // Use a toast for confirmation instead of window.confirm which can be blocked
    setImpersonatingId(userId);
    toast.info('Switching account...');

    try {
      await impersonate(userId);
      toast.success('Switched account successfully.');
      navigate('/');
    } catch (e) {
      console.error('Impersonation failed:', e);
      toast.error(e.response?.data?.message || 'Failed to switch account.');
    } finally {
      setImpersonatingId(null);
    }
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
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 700 }}>
            🤝 Franchise Network
          </span>
        </div>
        {role === 'admin' && (
          <button 
            className="btn btn-primary btn-sm" 
            id="fr-add-btn"
            onClick={() => { setEditingFranchise(null); setShowModal(true); }}
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
          <div key={fr.id} className="fr-card" onClick={() => handleView(fr)} style={{ cursor: 'pointer' }}>
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

            {role === 'admin' && (
              <div style={{ display: 'flex', gap: 4, marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-xs"
                  style={{ color: '#2563eb' }}
                  onClick={(e) => { e.stopPropagation(); setEditingFranchise(fr); setShowModal(true) }}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--red)' }}
                  onClick={(e) => { e.stopPropagation(); handleDelete(fr) }}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* detail modal */}
      {selected && (
        <div className="modal-overlay open" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560, width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🤝 {selected.name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', position: 'relative', overflowX: 'auto' }}>
                {['info', 'leads', 'clients'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveDetailTab(t)}
                    style={{ 
                      flex: 1, padding: '14px 20px', border: 'none', background: 'none', 
                      fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: activeDetailTab === t ? 'var(--accent)' : 'var(--text3)',
                      borderBottom: activeDetailTab === t ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px 32px', maxHeight: '65vh', overflowY: 'auto', animation: 'fadeIn 0.3s ease-out' }}>
                {activeDetailTab === 'info' && (
                  <>
                    <div className="kpi-row" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      <div className="kpi" style={{ background: 'var(--bg2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                        <div className="kpi-val" style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{selected.total_leads ?? 0}</div>
                        <div className="kpi-lbl" style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Leads</div>
                      </div>
                      <div className="kpi" style={{ background: 'var(--bg2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                        <div className="kpi-val" style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{selected.converted ?? 0}</div>
                        <div className="kpi-lbl" style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Converted</div>
                      </div>
                      <div className="kpi" style={{ background: 'var(--bg2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                        <div className="kpi-val" style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>{selected.members_count ?? 0}</div>
                        <div className="kpi-lbl" style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Members</div>
                      </div>
                    </div>
                    
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <tbody>
                        <InfoRow label="Code" val={selected.code} />
                        <InfoRow label="Owner" val={selected.owner_name} />
                        <InfoRow label="City" val={selected.city} />
                        <InfoRow label="Phone" val={selected.phone} />
                        <InfoRow label="Email" val={selected.email} />
                        <InfoRow label="Commission" val={selected.commission_rate} />
                      </tbody>
                    </table>

                    {isDetailsLoading && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                        <div style={{ width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>Syncing partner data...</div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    )}

                    {!isDetailsLoading && selected.users?.length > 0 && (
                      <div style={{ marginTop: 32 }}>
                        <div style={{ fontWeight: 800, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.05em' }}>Franchise Partners</div>
                        {selected.users.map(u => (
                          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg2)', borderRadius: 14, marginBottom: 10, border: '1px solid var(--border)', transition: 'transform 0.2s ease' }}>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.emp_code} • {u.status}</div>
                            </div>
                            <button 
                              className="btn btn-primary btn-xs"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleLoginAs(u.id); 
                              }}
                              disabled={u.status === 'Inactive' || impersonatingId === u.id}
                              style={{ borderRadius: 8, fontSize: 10, padding: '7px 12px', flexShrink: 0, marginLeft: 12, minWidth: 100 }}
                            >
                              {impersonatingId === u.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{ width: 10, height: 10, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                  <span>Wait...</span>
                                </div>
                              ) : '🔑 Impersonate'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!isDetailsLoading && (!selected.users || selected.users.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: 16, marginTop: 32 }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>
                        <div style={{ fontSize: 12 }}>No partners registered yet.</div>
                      </div>
                    )}
                  </>
                )}

                {activeDetailTab === 'leads' && (
                  <BusinessList data={detailData.leads} type="Leads" />
                )}

                {activeDetailTab === 'clients' && (
                  <BusinessList data={detailData.clients} type="Clients" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* add franchise modal */}
      <FranchiseModal
        isOpen={showModal}
        initialData={editingFranchise}
        onClose={() => { setShowModal(false); setEditingFranchise(null) }}
        onSuccess={() => { fetchFranchises(); setShowModal(false); setEditingFranchise(null) }}
      />
    </div>
  )
}
function InfoRow({ label, val }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ color: 'var(--text3)', padding: '14px 0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', width: '40%', verticalAlign: 'top' }}>{label}</td>
      <td style={{ fontWeight: 700, textAlign: 'right', padding: '14px 0', color: 'var(--text1)', wordBreak: 'break-word' }}>{val || '—'}</td>
    </tr>
  )
}

function BusinessList({ data, type }) {
  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
      No {type} found for this franchise.
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(item => (
        <div key={item.id} style={{ padding: 12, background: 'white', border: '1.5px solid var(--border)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>₹{item.amount || item.loan_amount || '0'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)' }}>
            <span>{item.loan_type} · {item.phone}</span>
            <span className={`badge ${STAGE_BADGE[item.stage] ?? 'badge-new'}`}>{item.stage}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const STAGE_BADGE = {
  New:'badge-new', Contacted:'badge-contacted', 'Docs Pending':'badge-docs',
  'Docs Received':'badge-docs', CIBIL:'badge-cibil', Login:'badge-login',
  Processing:'badge-processing', Sanctioned:'badge-sanction',
  Disbursed:'badge-disbursed', Closed:'badge-closed',
}
