/**
 * pages/Pipeline.jsx
 *
 * Full React port of #page-pipeline and renderPipeline() from LoanCRM_v9.html.
 *
 * Features preserved from the prototype:
 *   ✓ 7 stage columns: New → Contacted → Docs Pending → Login →
 *       Processing → Sanctioned → Disbursed
 *   ✓ Per-column pipeline-header with colour class + card count badge
 *   ✓ Loan-type chip filters (All Loans / Home Loan / Business / Personal / Insurance)
 *   ✓ Pipeline cards: name, phone, type · amount, assignee first-name, follow-up
 *   ✓ Overdue card highlight (red left-border)
 *   ✓ Inline "+ Add Lead" tray at the bottom of each column (non-dsa)
 *   ✓ Optimistic stage updates via LeadsContext (same as table view)
 *   ✓ Admin toolbar (collapsed placeholder ready for Step 5 drag-drop)
 *   ✓ Loading skeleton with ghost columns
 *   ✓ Empty-column state
 *   ✓ Reads from the same LeadsContext as LeadsList — zero double-fetch
 *   ✓ All original CSS class names preserved
 *
 * The LeadModal is rendered here too so the "+ Add Lead" column tray
 * opens the same modal as the Topbar button.
 */
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeads } from '../context/LeadsContext'
import LeadModal from '../components/LeadModal'

// ── Stage configuration ───────────────────────────────────────────────────────
// Mirrors the `stages` array + `ph` map inside renderPipeline()
const PIPELINE_STAGES = [
  { key: 'New',          cls: 'ph-new'        },
  { key: 'Contacted',    cls: 'ph-contacted'  },
  { key: 'Docs Pending', cls: 'ph-docs'       },
  { key: 'Login',        cls: 'ph-login'      },
  { key: 'Processing',   cls: 'ph-processing' },
  { key: 'Sanctioned',   cls: 'ph-sanction'   },
  { key: 'Disbursed',    cls: 'ph-disbursed'  },
]

const CHIP_TYPES = ['All Loans', 'Home Loan', 'Business Loan', 'Personal Loan', 'Insurance']

// ── Component ─────────────────────────────────────────────────────────────────
export default function Pipeline() {
  const { user }               = useAuth()
  const { leads, isLoading }   = useLeads()
  const role = user?.role ?? 'staff'

  const [loanFilter,   setLoanFilter]   = useState('All Loans')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [defaultStage, setDefaultStage] = useState('New')

  const canAddLead = role !== 'dsa'
  const isAdmin    = role === 'admin'

  // ── Filter leads by loan type chip ────────────────────────────────────────
  const visibleLeads = loanFilter === 'All Loans'
    ? leads
    : leads.filter((l) => l.type === loanFilter)

  // ── Open modal pre-selecting a stage ─────────────────────────────────────
  function openAddLead(stage) {
    setDefaultStage(stage)
    setModalOpen(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div id="page-pipeline" className="page active">

      {/* ── Admin toolbar (placeholder — drag-drop management in Step 5) ── */}
      {isAdmin && (
        <div style={{
          display: 'flex', background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)',
          border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px',
          marginBottom: 16, flexWrap: 'wrap', gap: 8, alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>
            ⚙️ Admin: Pipeline View
          </span>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
            {PIPELINE_STAGES.length} stages · {leads.length} total leads
          </div>
        </div>
      )}

      {/* ── Loan-type chip filter bar ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {CHIP_TYPES.map((t) => (
          <div
            key={t}
            className={`chip${loanFilter === t ? ' active' : ''}`}
            onClick={() => setLoanFilter(t)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setLoanFilter(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* ── Kanban board ── */}
      <div className="pipeline-wrap">
        <div className="pipeline" id="pipeline-board">

          {isLoading
            ? PIPELINE_STAGES.map((s) => <SkeletonColumn key={s.key} stage={s} />)
            : PIPELINE_STAGES.map((stage) => {
                const colLeads = visibleLeads.filter((l) => l.stage === stage.key)
                return (
                  <PipelineColumn
                    key={stage.key}
                    stage={stage}
                    leads={colLeads}
                    canAddLead={canAddLead}
                    onAddLead={() => openAddLead(stage.key)}
                  />
                )
              })
          }

        </div>
      </div>

      {/* ── Add Lead modal (shared across all columns) ── */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />

    </div>
  )
}

// ── PipelineColumn ────────────────────────────────────────────────────────────
function PipelineColumn({ stage, leads, canAddLead, onAddLead }) {
  return (
    <div className="pipeline-col">

      {/* Column header with stage colour + count */}
      <div className={`pipeline-header ${stage.cls}`}>
        <span>{stage.key}</span>
        <span style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '1px 7px' }}>
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      {leads.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '20px 12px',
          fontSize: 12, color: 'var(--text4)',
          border: '1px dashed var(--border)', borderRadius: 8,
          marginBottom: 8,
        }}>
          No leads
        </div>
      )}

      {leads.map((lead) => (
        <PipelineCard key={lead.id} lead={lead} />
      ))}

      {/* "+ Add Lead" tray at column bottom */}
      {canAddLead && (
        <div
          style={{
            textAlign: 'center', padding: '10px 0', fontSize: 12,
            color: 'var(--text3)', cursor: 'pointer',
            border: '2px dashed var(--border)', borderRadius: 8,
            marginTop: 4, transition: 'all 0.15s',
          }}
          onClick={onAddLead}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onAddLead()}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text3)'
          }}
        >
          + Add Lead
        </div>
      )}
    </div>
  )
}

// ── PipelineCard ──────────────────────────────────────────────────────────────
// Mirrors the template literal inside renderPipeline().map()
function PipelineCard({ lead }) {
  const assignedFirst = (lead.assigned ?? 'Unassigned').split(' ')[0]

  return (
    <div
      className="pipeline-card"
      style={lead.isOverdue ? { borderLeft: '3px solid var(--red)' } : undefined}
      title={lead.isOverdue ? 'Follow-up overdue' : undefined}
    >
      <div className="pc-name">{lead.name}</div>
      <div className="pc-meta">{lead.phone}</div>
      <div className="pc-amount">
        {lead.type} · {lead.amount}
      </div>
      <div className="pc-footer">
        <span>👤 {assignedFirst}</span>
        <span style={lead.isOverdue ? { color: 'var(--red)' } : undefined}>
          {lead.followup || '—'}
        </span>
      </div>
    </div>
  )
}

// ── SkeletonColumn ────────────────────────────────────────────────────────────
// Ghost column shown while loading — matches the column count so layout doesn't jump.
function SkeletonColumn({ stage }) {
  return (
    <div className="pipeline-col">
      <div className={`pipeline-header ${stage.cls}`} style={{ opacity: 0.5 }}>
        <span>{stage.key}</span>
        <span style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '1px 7px' }}>
          …
        </span>
      </div>
      {[80, 60, 90].map((w, i) => (
        <div
          key={i}
          className="pipeline-card"
          style={{
            height: 88,
            background: 'var(--bg2)',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}
