/**
 * pages/Leads.jsx
 *
 * Lead Management page — the full table view.
 *
 * Assembles:
 *   <LeadsFilterBar>  — search + stage/type/priority dropdowns
 *   <LeadsList>       — sortable table with inline stage editing
 *   <LeadModal>       — add-new-lead modal
 *
 * The "+ New Lead" button in the Topbar is wired via MainLayout's
 * NewLeadContext — this page registers its open-modal callback on mount
 * so the Topbar button works while /leads is the active route.
 *
 * Filter state lives here (not in the table component) so the filter bar
 * and the table are in the same re-render cycle and the URL can carry
 * filter state in a future step.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNewLeadTrigger } from '../components/MainLayout'
import LeadsList, { LeadsFilterBar } from '../components/LeadsList'
import LeadModal from '../components/LeadModal'
import DateRangeFilter from '../components/DateRangeFilter'

export default function Leads() {
  const { user }           = useAuth()
  const registerNewLead    = useNewLeadTrigger()
  const role               = user?.role ?? 'staff'
  const canEdit            = ['admin', 'manager', 'staff'].includes(role)

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)

  // ── Filter state (lifted here so FilterBar and LeadsList share it) ─────────
  const [filters, setFilters] = useState({
    search: '', stage: '', loanType: '', priority: '',
  })

  // ── Date range filter for PRD requirement ─────────────────────────────────
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  function handleFilterChange(key, val) {
    setFilters((prev) => ({ ...prev, [key]: val }))
  }

  // ── Register the Topbar "+ New Lead" trigger on mount ─────────────────────
  useEffect(() => {
    if (canEdit) {
      registerNewLead?.(() => { setEditingLead(null); setModalOpen(true); })
      return () => registerNewLead?.(null)
    }
  }, [canEdit, registerNewLead])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div id="page-leads" className="page active">

      {/* Date range filter */}
      <DateRangeFilter onApply={setDateRange} />

      {/* Filter bar above the table card */}
      <LeadsFilterBar
        search={filters.search}
        stage={filters.stage}
        loanType={filters.loanType}
        priority={filters.priority}
        onChange={handleFilterChange}
        onAdd={() => setModalOpen(true)}
        canEdit={canEdit}
      />

      {/* The table — passes filter state down */}
      <LeadsList
        filters={filters}
        onAddLead={() => { setEditingLead(null); setModalOpen(true); }}
        onEditLead={(lead) => { setEditingLead(lead); setModalOpen(true); }}
      />

      {/* Add Lead modal */}
      <LeadModal
        isOpen={modalOpen}
        initialData={editingLead}
        onClose={() => { setModalOpen(false); setEditingLead(null); }}
        onSuccess={() => { setModalOpen(false); setEditingLead(null); }}
      />

    </div>
  )
}
