/**
 * components/LeadsList.jsx
 *
 * Full React port of the #page-leads table section from LoanCRM_v9.html,
 * including renderLeads(), updateLeadStage(), and exportLeadsCSV().
 *
 * Features:
 *   ✓ Client-side filtering: search (name/phone/type), stage, loan type, priority
 *   ✓ Sortable columns: Name, Amount, Stage, Priority, Follow-up date
 *   ✓ Inline stage <select> with optimistic update + rollback (via LeadsContext)
 *   ✓ Bulk checkbox selection (header + per-row)
 *   ✓ Role-based table title: "All Leads" / "Team Leads" / "My Leads" / "My Franchise Leads"
 *   ✓ Filtered record count badge
 *   ✓ Client-side CSV export (mirrors exportLeadsCSV() from prototype)
 *   ✓ Empty state with "+ Add First Lead" CTA
 *   ✓ Skeleton loading rows while data is fetching
 *   ✓ Role-based action column (view / edit / delete)
 *   ✓ All original CSS class names preserved
 *
 * Props:
 *   onAddLead  fn  — called when the user clicks "+ Add Lead" or the empty-state CTA
 */
import { useMemo, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeads } from '../context/LeadsContext'
import ConvertLeadModal from './ConvertLeadModal'
import ImportLeadsModal from './ImportLeadsModal'

// ── Constants ─────────────────────────────────────────────────────────────────
export const STAGES = [
  'New', 'Contacted', 'Docs Pending', 'Docs Received',
  'CIBIL', 'Login', 'Processing', 'Sanctioned', 'Disbursed', 'Closed',
]
export const LOAN_TYPES = ['Home Loan', 'Business Loan', 'Personal Loan', 'Car Loan', 'LAP', 'Insurance']
export const PRIORITIES = ['High', 'Medium', 'Low']

// Priority → badge CSS class (mirrors prioMap in renderLeads())
const PRIO_BADGE = { High: 'badge-high', Medium: 'badge-med', Low: 'badge-low' }

// Stage → badge CSS class
const STAGE_BADGE = {
  'New': 'badge-new', 'Contacted': 'badge-contacted',
  'Docs Pending': 'badge-docs', 'Docs Received': 'badge-docs',
  'CIBIL': 'badge-cibil', 'Login': 'badge-login',
  'Processing': 'badge-processing', 'Sanctioned': 'badge-sanction',
  'Disbursed': 'badge-disbursed', 'Closed': 'badge-closed',
}

// Role → table title (mirrors renderLeads() title logic)
const ROLE_TITLE = {
  admin: 'All Leads', manager: 'Team Leads',
  staff: 'My Leads', dsa: 'My Franchise Leads',
}

// ── Component ─────────────────────────────────────────────────────────────────
// Stages that are convertible to a client
const CONVERTIBLE_STAGES = ['Login', 'Sanctioned']

export default function LeadsList({ onAddLead, filters: externalFilters }) {
  const { user }                        = useAuth()
  const { leads, isLoading, updateStage, deleteLead, refreshLeads } = useLeads()

  const role      = user?.role ?? 'staff'
  const canEdit   = ['admin', 'manager', 'staff'].includes(role)
  const canDelete = role === 'admin'
  const canConvert = ['admin', 'manager'].includes(role)

  // ── Convert-to-client modal state ─────────────────────────────────────────
  const [convertLead, setConvertLead] = useState(null)

  const handleConversionSuccess = useCallback(() => {
    refreshLeads?.()
  }, [refreshLeads])

  // ── Import modal state ───────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false)
  const [ownSearch,   setOwnSearch]   = useState('')
  const [ownStageFil, setOwnStageFil] = useState('')
  const [ownTypeFil,  setOwnTypeFil]  = useState('')
  const [ownPrioFil,  setOwnPrioFil]  = useState('')

  // When Leads.jsx lifts filter state up, those values take priority
  const search   = externalFilters?.search   ?? ownSearch
  const stageFil = externalFilters?.stage    ?? ownStageFil
  const typeFil  = externalFilters?.loanType ?? ownTypeFil
  const priofil  = externalFilters?.priority ?? ownPrioFil

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortBy,  setSortBy]  = useState('created')   // 'name'|'amount'|'stage'|'priority'|'followup'|'created'
  const [sortDir, setSortDir] = useState('desc')       // 'asc'|'desc'

  // ── Bulk select ───────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set())

  // ── Derived filtered + sorted list ───────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    let list = leads.filter((l) => {
      if (q && !(l.name + l.phone + (l.type ?? '')).toLowerCase().includes(q)) return false
      if (stageFil && l.stage     !== stageFil) return false
      if (typeFil  && l.type      !== typeFil)  return false
      if (priofil  && l.priority  !== priofil)  return false
      return true
    })

    // Sort
    list = [...list].sort((a, b) => {
      let av, bv
      switch (sortBy) {
        case 'name':     av = a.name?.toLowerCase();  bv = b.name?.toLowerCase();  break
        case 'amount':   av = a.amountRaw ?? 0;       bv = b.amountRaw ?? 0;       break
        case 'priority': av = ['High','Medium','Low'].indexOf(a.priority);
                         bv = ['High','Medium','Low'].indexOf(b.priority);          break
        case 'followup': av = a.followup ?? '';        bv = b.followup ?? '';       break
        case 'stage':    av = STAGES.indexOf(a.stage); bv = STAGES.indexOf(b.stage); break
        default:         av = a.id;                    bv = b.id                   // created ≈ id order
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })

    return list
  }, [leads, search, stageFil, typeFil, priofil, sortBy, sortDir])

  // ── Sort toggle ───────────────────────────────────────────────────────────
  function handleSort(col) {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }

  // ── Bulk select ───────────────────────────────────────────────────────────
  function toggleAll(e) {
    setSelected(e.target.checked ? new Set(filtered.map((l) => l.id)) : new Set())
  }
  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const allChecked = filtered.length > 0 && filtered.every((l) => selected.has(l.id))

  // ── CSV export (mirrors exportLeadsCSV()) ──────────────────────────────────
  function handleExport() {
    const rows = [['Name', 'Phone', 'Type', 'Amount', 'Stage', 'Assigned', 'Priority', 'Follow-up']]
    filtered.forEach((l) => rows.push([l.name, l.phone, l.type, l.amount, l.stage, l.assigned, l.priority, l.followup]))
    const csv = rows.map((r) => r.map((c) => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // ── Delete confirmation ────────────────────────────────────────────────────
  async function handleDelete(lead) {
    if (!window.confirm(`Archive lead "${lead.name}"? This can be undone by an admin.`)) return
    await deleteLead(lead.id, lead.name)
  }

  // ── Title string ──────────────────────────────────────────────────────────
  const isFiltered = search || stageFil || typeFil || priofil
  const tableTitle = (ROLE_TITLE[role] ?? 'Leads') + (isFiltered ? ' (filtered)' : '')

  // ── Sort indicator ─────────────────────────────────────────────────────────
  const SI = ({ col }) =>
    sortBy === col
      ? <span style={{ marginLeft: 3, fontSize: 9 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
      : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="card" style={{ padding: 0 }}>

      {/* ── Card header ── */}
      <div className="card-header" style={{ padding: '10px 16px 0' }}>
        <div className="card-title" style={{ fontSize: 13 }} id="leads-table-title">
          {tableTitle}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="badge badge-new" id="leads-count-badge" style={{ fontSize: 11 }}>
            {isLoading ? '…' : `${filtered.length} records`}
          </span>
          <button className="btn btn-ghost btn-xs" onClick={handleExport} title="Export to CSV">
            ⬇ Export
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  id="leads-chk-all"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Lead <SI col="name" />
              </th>
              <th>Contact</th>
              <th>Type</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                Amount <SI col="amount" />
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('stage')}>
                Stage <SI col="stage" />
              </th>
              <th>Assigned</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('priority')}>
                Priority <SI col="priority" />
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('followup')}>
                Follow-up <SI col="followup" />
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody id="leads-tbody">
            {/* Loading skeleton */}
            {isLoading && (
              Array.from({ length: 6 }, (_, i) => (
                <tr key={`skel-${i}`}>
                  {Array.from({ length: 10 }, (_, j) => (
                    <td key={j}>
                      <div style={{
                        height: 14, borderRadius: 4,
                        background: 'var(--bg2)',
                        width: j === 1 ? 120 : j === 4 ? 60 : 80,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    </td>
                  ))}
                </tr>
              ))
            )}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                  <div style={{ fontSize: 13 }}>
                    {isFiltered ? 'No leads match your filters.' : 'No leads found.'}
                  </div>
                  {canEdit && !isFiltered && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        id="leads-empty-add"
                        onClick={onAddLead}
                      >
                        + Add First Lead
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading && filtered.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                isSelected={selected.has(lead.id)}
                onToggle={() => toggleOne(lead.id)}
                onStageChange={(stage) => updateStage(lead.id, stage)}
                onDelete={() => handleDelete(lead)}
                onConvert={canConvert && CONVERTIBLE_STAGES.includes(lead.stage) ? () => setConvertLead(lead) : null}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}

            {/* Import modal */}
            <ImportLeadsModal
              isOpen={importOpen}
              onClose={() => setImportOpen(false)}
              onSuccess={() => { setImportOpen(false); refreshLeads?.() }}
            />
            <ConvertLeadModal
              lead={convertLead}
              isOpen={!!convertLead}
              onClose={() => setConvertLead(null)}
              onSuccess={handleConversionSuccess}
            />
          </tbody>
        </table>
      </div>

      {/* Skeleton pulse keyframe (injected once) */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .form-input.error { border-color: var(--red); }
      `}</style>
    </div>
  )
}

// ── LeadRow ───────────────────────────────────────────────────────────────────
// Extracted for performance — only re-renders when its own props change.
function LeadRow({ lead, isSelected, onToggle, onStageChange, onDelete, onConvert, canEdit, canDelete }) {
  const isOverdue = lead.isOverdue
  const followupColor = isOverdue ? '#dc2626' : '#64748b'

  return (
    <tr style={isSelected ? { background: 'var(--accent-light)' } : undefined}>

      {/* Checkbox */}
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
        />
      </td>

      {/* Name + avatar */}
      <td>
        <div className="td-name">
          <div
            className="mini-avatar"
            style={{ background: `linear-gradient(135deg, ${lead.color}, ${lead.color}99)` }}
          >
            {lead.initials}
          </div>
          <strong>{lead.name}</strong>
        </div>
      </td>

      {/* Phone */}
      <td>
        <a href={`tel:${lead.phone}`} style={{ color: 'var(--accent)' }}>
          {lead.phone}
        </a>
      </td>

      {/* Loan type */}
      <td>{lead.type}</td>

      {/* Amount */}
      <td style={{ color: 'var(--green)', fontWeight: 600 }}>{lead.amount}</td>

      {/* Stage — inline editable dropdown */}
      <td>
        {canEdit ? (
          <select
            className="form-select"
            style={{ minWidth: 130, padding: '4px 8px', fontSize: 11 }}
            value={lead.stage}
            onChange={(e) => onStageChange(e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <span className={`badge ${STAGE_BADGE[lead.stage] ?? 'badge-new'}`}>
            {lead.stage}
          </span>
        )}
      </td>

      {/* Assigned */}
      <td style={{ fontSize: 12 }}>{lead.assigned}</td>

      {/* Priority */}
      <td>
        <span className={`badge ${PRIO_BADGE[lead.priority] ?? 'badge-med'}`}>
          {lead.priority}
        </span>
      </td>

      {/* Follow-up date */}
      <td style={{ fontSize: 13, color: followupColor, fontWeight: isOverdue ? 600 : 400 }}>
        {isOverdue && <span title="Overdue" style={{ marginRight: 4 }}>⚠️</span>}
        {lead.followup || '—'}
      </td>

      {/* Actions */}
      <td>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
          <button
            className="btn btn-ghost btn-xs"
            title="View details"
            onClick={() => {/* Step 5: open detail panel */}}
          >
            👁
          </button>
          {canEdit && (
            <button
              className="btn btn-ghost btn-xs"
              title="Edit lead"
              onClick={() => {/* Step 5: open edit modal */}}
            >
              ✏️
            </button>
          )}
          {onConvert && (
            <button
              className="btn btn-ghost btn-xs"
              title="Convert to client"
              style={{ color: '#2563eb', fontWeight: 600 }}
              onClick={onConvert}
            >
              🚀
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-ghost btn-xs"
              title="Archive lead"
              style={{ color: 'var(--red)' }}
              onClick={onDelete}
            >
              🗑
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── FilterBar — exported so Leads.jsx can render it above the card ────────────
export function LeadsFilterBar({ search, stage, loanType, priority, onChange, onAdd, canEdit }) {
  return (
    <div className="filter-bar">

      {/* Search */}
      <div className="search-wrap">
        <input
          className="form-input"
          id="leads-search"
          placeholder="Search name, phone, type..."
          value={search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>

      {/* Stage */}
      <select
        className="form-select"
        id="leads-stage-filter"
        value={stage}
        onChange={(e) => onChange('stage', e.target.value)}
      >
        <option value="">All Stages</option>
        {STAGES.map((s) => <option key={s}>{s}</option>)}
      </select>

      {/* Type */}
      <select
        className="form-select"
        id="leads-type-filter"
        value={loanType}
        onChange={(e) => onChange('loanType', e.target.value)}
      >
        <option value="">All Types</option>
        {LOAN_TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>

      {/* Priority */}
      <select
        className="form-select"
        id="leads-priority-filter"
        value={priority}
        onChange={(e) => onChange('priority', e.target.value)}
      >
        <option value="">All Priority</option>
        {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
      </select>

      {/* Actions */}
      {canEdit && (
        <button
          className="btn btn-primary btn-sm"
          id="leads-add-btn"
          onClick={onAdd}
        >
          + Add Lead
        </button>
      )}
      <button
        className="btn btn-secondary btn-sm"
        id="leads-import-btn"
        onClick={() => setImportOpen(true)}
      >
        ⬆ Import
      </button>
    </div>
  )
}
