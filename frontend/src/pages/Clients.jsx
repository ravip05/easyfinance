/**
 * pages/Clients.jsx
 *
 * Client Profiles page shell.
 * Full table, filters, and client detail panel are built in Step 4.
 */
import { useSearchQuery } from '../components/MainLayout'

export default function Clients() {
  const searchQuery = useSearchQuery()

  return (
    <div id="page-clients" className="page active">

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="search-wrap">
          <input
            className="form-input"
            placeholder="Search clients…"
            value={searchQuery}
            readOnly
          />
        </div>
        <select className="form-select" style={{ width: 'auto' }}>
          <option value="">All Stages</option>
          {['New','Docs Pending','Login','Processing','Sanctioned','Disbursed']
            .map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }}>
          <option value="">All Loan Types</option>
          {['Home Loan','Business Loan','Personal Loan','Car Loan','LAP','Insurance']
            .map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* ── Table placeholder ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Client Profiles</div>
            <div className="card-sub">Full API-connected table coming in Step 4</div>
          </div>
        </div>
        <div className="empty" style={{ padding: '40px 20px' }}>
          <div className="empty-icon">👤</div>
          <div className="empty-text">
            The clients table with CIBIL scores, loan amounts, bank details,<br />
            and the lead-conversion flow will be built in Step 4.
          </div>
        </div>
      </div>

    </div>
  )
}
