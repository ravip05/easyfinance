import { useToast } from '../context/ToastContext'

const BADGE_COLORS = { phone: '#2563eb', pan_number: '#7c3aed' }

export default function Duplicates() {
  const toast = useToast()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchDuplicates() }, [])

  async function fetchDuplicates() {
    setLoading(true)
    try {
      const res = await apiClient.get('/leads/duplicates')
      setGroups(res.data?.data ?? [])
    } catch { setGroups([]) }
    setLoading(false)
  }

  async function handleMerge(group) {
    if (!window.confirm(`Are you sure you want to merge ${group.count} leads with ${group.type} ${group.value}? The oldest lead will be kept as master.`)) return;
    
    // Sort leads by creation date (oldest first) to pick a master
    const sortedLeads = [...group.leads].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const master = sortedLeads[0];
    const duplicates = sortedLeads.map(l => l.id);

    try {
      const res = await apiClient.post('/leads/merge', {
        master_id: master.id,
        duplicate_ids: duplicates
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Leads merged successfully.');
        fetchDuplicates(); // refresh the list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to merge leads.');
    }
  }

  async function handleArchive(group) {
    if (!window.confirm(`Are you sure you want to archive duplicates for ${group.type} ${group.value}? This will keep the newest lead and archive the rest.`)) return;

    // Sort leads by creation date (newest first) to pick a master
    const sortedLeads = [...group.leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const master = sortedLeads[0];
    const duplicates = sortedLeads.map(l => l.id);

    try {
      const res = await apiClient.post('/leads/merge', {
        master_id: master.id,
        duplicate_ids: duplicates
      });
      if (res.data?.success) {
        toast.success('Duplicates archived successfully.');
        fetchDuplicates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive leads.');
    }
  }

  return (
    <div id="page-duplicates" className="page active">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">🔍 Duplicate Checker</div>
          <button className="btn btn-sm" onClick={fetchDuplicates} style={{ fontSize: 12 }}>↻ Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Scanning for duplicates...</div>
        ) : groups.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            No duplicate leads found. Your data is clean.
          </div>
        ) : (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
              Found {groups.length} duplicate group{groups.length > 1 ? 's' : ''}
            </div>

            {groups.map((g, i) => (
              <div key={i} style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                marginBottom: 10,
                overflow: 'hidden',
                background: 'var(--card)',
              }}>
                {/* group header */}
                <div
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', cursor: 'pointer',
                    background: expanded === i ? 'var(--bg)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: BADGE_COLORS[g.type] || '#666',
                      color: '#fff', fontSize: 10, padding: '2px 6px',
                      borderRadius: 4, fontWeight: 700, textTransform: 'uppercase',
                    }}>{g.type === 'pan_number' ? 'PAN' : 'Phone'}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{g.value}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{g.count} leads</span>
                    <span style={{ fontSize: 14 }}>{expanded === i ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* expanded lead list */}
                {expanded === i && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Loan Type</th>
                            <th>Stage</th>
                            <th>Assigned To</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(g.leads || []).map(lead => (
                            <tr key={lead.id}>
                              <td style={{ fontWeight: 600 }}>#{lead.id}</td>
                              <td>{lead.name}</td>
                              <td>{lead.phone}</td>
                              <td>{lead.loan_type}</td>
                              <td><span className={`badge badge-${(lead.stage || '').toLowerCase().replace(/ /g, '')}`}>{lead.stage}</span></td>
                              <td>{lead.assigned_user?.name || '—'}</td>
                              <td style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.created_at?.split(' ')[0]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: 'flex', gap: 8, padding: '8px 14px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm" onClick={() => handleMerge(g)} style={{ background: 'var(--accent)', color: '#fff', fontSize: 11 }}>
                        ⛙ Merge
                      </button>
                      <button className="btn btn-sm" onClick={() => handleArchive(g)} style={{ background: 'var(--danger, #ef4444)', color: '#fff', fontSize: 11 }}>
                        🗑 Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
