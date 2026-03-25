/**
 * pages/Pipeline.jsx
 *
 * Full drag-and-drop Kanban board for loan pipeline management.
 * Uses HTML5 Drag & Drop API (zero external dependencies).
 * Stage updates are dispatched through LeadsContext.updateStage()
 * which performs optimistic updates with automatic rollback on failure.
 *
 * Features:
 *   ✓ 7 stage columns: New → Contacted → Docs Pending → Login →
 *       Processing → Sanctioned → Disbursed
 *   ✓ Full drag-and-drop between columns with visual drop indicators
 *   ✓ Loan-type chip filters
 *   ✓ "Add Lead" tray at bottom of each column
 *   ✓ Overdue card highlight (red left-border)
 *   ✓ Admin toolbar with total lead count
 *   ✓ Loading skeleton with ghost columns
 */
import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeads } from '../context/LeadsContext'
import LeadModal from '../components/LeadModal'

// ── Stage configuration ───────────────────────────────────────────────────────
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
  const { user }             = useAuth()
  const { leads, isLoading, updateStage } = useLeads()
  const role = user?.role ?? 'staff'

  const [loanFilter,   setLoanFilter]   = useState('All Loans')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [defaultStage, setDefaultStage] = useState('New')
  const [dragOverCol,  setDragOverCol]  = useState(null)
  const dragRef = useRef(null)

  const canAddLead = role !== 'dsa'
  const isAdmin    = role === 'admin'

  // Filter leads by loan type chip
  const visibleLeads = loanFilter === 'All Loans'
    ? leads
    : leads.filter((l) => l.type === loanFilter)

  // Open modal pre-selecting a stage
  function openAddLead(stage) {
    setDefaultStage(stage)
    setModalOpen(true)
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleDragStart(e, lead) {
    dragRef.current = lead
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    // Make the dragged card semi-transparent
    requestAnimationFrame(() => {
      e.target.style.opacity = '0.5'
    })
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1'
    dragRef.current = null
    setDragOverCol(null)
  }

  function handleDragOver(e, stageKey) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(stageKey)
  }

  function handleDragLeave(e, stageKey) {
    // Only clear if truly leaving the column (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCol(null)
    }
  }

  function handleDrop(e, stageKey) {
    e.preventDefault()
    setDragOverCol(null)
    const lead = dragRef.current
    if (lead && lead.stage !== stageKey) {
      updateStage(lead.id, stageKey)
    }
    dragRef.current = null
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div id="page-pipeline" className="page active">

      {/* Admin toolbar */}
      {isAdmin && (
        <div style={{
          display: 'flex', background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)',
          border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px',
          marginBottom: 16, flexWrap: 'wrap', gap: 8, alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>
            ⚙️ Admin: Drag & Drop Pipeline
          </span>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
            {PIPELINE_STAGES.length} stages · {leads.length} total leads · Drag cards between columns to update stage
          </div>
        </div>
      )}

      {/* Loan-type chip filter bar */}
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

      {/* Kanban board */}
      <div className="pipeline-wrap">
        <div className="pipeline" id="pipeline-board">

          {isLoading
            ? PIPELINE_STAGES.map((s) => <SkeletonColumn key={s.key} stage={s} />)
            : PIPELINE_STAGES.map((stage) => {
                const colLeads = visibleLeads.filter((l) => l.stage === stage.key)
                const isOver = dragOverCol === stage.key
                return (
                  <div
                    key={stage.key}
                    className="pipeline-col"
                    onDragOver={(e) => handleDragOver(e, stage.key)}
                    onDragLeave={(e) => handleDragLeave(e, stage.key)}
                    onDrop={(e) => handleDrop(e, stage.key)}
                    style={{
                      transition: 'background 0.2s, border-color 0.2s',
                      background: isOver ? 'var(--accent-light)' : 'transparent',
                      borderRadius: isOver ? 10 : 0,
                      border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
                      padding: isOver ? 4 : 0,
                    }}
                  >
                    {/* Column header */}
                    <div className={`pipeline-header ${stage.cls}`}>
                      <span>{stage.key}</span>
                      <span style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '1px 7px' }}>
                        {colLeads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    {colLeads.length === 0 && (
                      <div style={{
                        textAlign: 'center', padding: '20px 12px',
                        fontSize: 12, color: 'var(--text4)',
                        border: '1px dashed var(--border)', borderRadius: 8,
                        marginBottom: 8,
                      }}>
                        {isOver ? '⬇️ Drop here' : 'No leads'}
                      </div>
                    )}

                    {colLeads.map((lead) => (
                      <PipelineCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))}

                    {/* "+ Add Lead" tray */}
                    {canAddLead && (
                      <div
                        style={{
                          textAlign: 'center', padding: '10px 0', fontSize: 12,
                          color: 'var(--text3)', cursor: 'pointer',
                          border: '2px dashed var(--border)', borderRadius: 8,
                          marginTop: 4, transition: 'all 0.15s',
                        }}
                        onClick={() => openAddLead(stage.key)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openAddLead(stage.key)}
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
              })
          }

        </div>
      </div>

      {/* Add Lead modal */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />

    </div>
  )
}

// ── PipelineCard (Draggable) ──────────────────────────────────────────────────
function PipelineCard({ lead, onDragStart, onDragEnd }) {
  const assignedFirst = (lead.assigned ?? 'Unassigned').split(' ')[0]

  return (
    <div
      className="pipeline-card"
      draggable="true"
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      style={{
        ...(lead.isOverdue ? { borderLeft: '3px solid var(--red)' } : {}),
        cursor: 'grab',
      }}
      title={lead.isOverdue ? 'Follow-up overdue — drag to update stage' : 'Drag to move between stages'}
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
