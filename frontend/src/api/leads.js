/**
 * api/leads.js
 *
 * All API calls for the leads domain.
 * Every function returns the axios promise — callers handle loading/error.
 *
 * Mirrors the apiFetch() calls in LoanCRM_v9.html:
 *   GET  /api/leads              → leadsApi.list()
 *   POST /api/leads              → leadsApi.create()
 *   POST /api/leads?force=1      → leadsApi.createForce()  (duplicate bypass)
 *   PATCH /api/leads/:id/stage   → leadsApi.updateStage()
 *   PATCH /api/leads/:id/assign  → leadsApi.reassign()
 *   DELETE /api/leads/:id        → leadsApi.destroy()
 *   GET  /api/leads/pipeline/stats → leadsApi.pipelineStats()
 *   GET  /api/leads/export/csv   → leadsApi.exportCsv()
 *   GET  /api/staff              → staffApi.list()
 */
import apiClient from './client'

export const leadsApi = {
  /**
   * Fetch paginated leads list.
   * @param {Object} params  — { search, stage, loan_type, priority, per_page, sort_by, sort_dir }
   */
  list: (params = {}) =>
    apiClient.get('/leads', { params: { per_page: 200, ...params } }),

  /** Create a new lead. Payload matches StoreLeadRequest rules. */
  create: (data) =>
    apiClient.post('/leads', data),

  /** Create even when a duplicate phone exists (?force=1). */
  createForce: (data) =>
    apiClient.post('/leads?force=1', data),

  /** Update any lead fields. */
  update: (id, data) =>
    apiClient.patch(`/leads/${id}`, data),

  /**
   * Lightweight stage-only update.
   * Used by the inline stage dropdown and pipeline drag (Step 5).
   * Returns { previous_stage, data } so optimistic rollback is trivial.
   */
  updateStage: (id, stage) =>
    apiClient.patch(`/leads/${id}/stage`, { stage }),

  /** Reassign a lead to a different user (admin/manager only). */
  reassign: (id, assignedTo) =>
    apiClient.patch(`/leads/${id}/assign`, { assigned_to: assignedTo }),

  /** Soft-delete (admin only). */
  destroy: (id) =>
    apiClient.delete(`/leads/${id}`),

  /** Per-stage counts for pipeline column headers. */
  pipelineStats: () =>
    apiClient.get('/leads/pipeline/stats'),

  /** Download CSV — returns a Blob. */
  exportCsv: () =>
    apiClient.get('/leads/export/csv', { responseType: 'blob' }),
}

/** Staff / Employee management APIs */
export const employeesApi = {
  list: (params = {}) => apiClient.get('/employees', { params }),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.patch(`/employees/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/employees/${id}/status`, { status }),
  destroy: (id) => apiClient.delete(`/employees/${id}`),
}

/** Staff list for the "Assign To" dropdown in the modal (Legacy helper) */
export const staffApi = {
  list: () => apiClient.get('/staff'),
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * normalizeApiLead(l)
 *
 * React port of normalizeApiLead() from LoanCRM_v9.html.
 * Converts the raw API response shape into the shape components use.
 *
 * Preserves every field the prototype uses:
 *   l.name, l.initials, l.color, l.phone, l.email,
 *   l.type (= loan_type), l.amount (formatted string),
 *   l.stage, l.priority, l.assigned (name string),
 *   l.assignedId, l.followup, l.franchiseCode,
 *   l.source, l.notes, l.addedBy, l._raw (original)
 */
export function normalizeApiLead(l) {
  const amtRaw = parseFloat(l.amount) || 0
  const amtFmt =
    amtRaw >= 10_000_000 ? `₹${(amtRaw / 10_000_000).toFixed(1)}Cr`
    : amtRaw >= 100_000  ? `₹${Math.round(amtRaw / 100_000)}L`
    : amtRaw > 0         ? `₹${amtRaw.toLocaleString('en-IN')}`
    : 'TBD'

  const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#ea580c', '#0891b2']
  const words  = (l.name || '').trim().split(/\s+/)

  return {
    // ── identifiers ─────────────────────────────────────────────────────────
    id:           l.id,
    _raw:         l,                                  // keep for future API calls
    // ── display ─────────────────────────────────────────────────────────────
    name:         l.name,
    initials:     words.map((w) => w[0] || '').join('').slice(0, 2).toUpperCase(),
    color:        COLORS[l.id % COLORS.length],
    // ── contact ─────────────────────────────────────────────────────────────
    phone:        l.phone,
    email:        l.email || '',
    // ── loan ────────────────────────────────────────────────────────────────
    type:         l.loan_type,                        // components use l.type
    amount:       amtFmt,                             // formatted "₹45L" string
    amountRaw:    amtRaw,                             // raw number for sorting
    // ── pipeline ────────────────────────────────────────────────────────────
    stage:        l.stage,
    priority:     l.priority,
    // ── assignment ──────────────────────────────────────────────────────────
    assigned:     l.assigned_user?.name ?? 'Unassigned',
    assignedId:   l.assigned_to ?? null,
    followup:     l.follow_up_date ?? '',
    franchiseCode:l.franchise_code ?? null,
    // ── meta ────────────────────────────────────────────────────────────────
    source:       l.source ?? 'Direct',
    notes:        l.notes  ?? '',
    addedBy:      l.added_by_user?.name ?? '',
    isOverdue:    l.is_overdue ?? false,
  }
}
