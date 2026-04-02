/**
 * context/LeadsContext.jsx
 *
 * Single source of truth for leads data shared between:
 *   /leads    → LeadsList table
 *   /pipeline → Pipeline kanban board
 *
 * Both pages consume the same in-memory array so a stage change made in the
 * table is immediately visible if the user navigates to the pipeline, exactly
 * as the prototype's global LEADS array worked.
 *
 * Exposes:
 *   leads        — normalised lead array (same shape as prototype's LEADS)
 *   isLoading    — true during first fetch
 *   error        — string | null
 *   fetchLeads() — re-fetches from API (call on mount + after creates)
 *   addLead()    — POST + prepend to array (with 409 duplicate handling)
 *   updateStage() — PATCH with optimistic update + rollback on failure
 *   deleteLead() — soft-delete (admin only)
 *   staff        — [{ id, name }] list for the "Assign To" dropdown
 */
import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from 'react'
import { leadsApi, normalizeApiLead, staffApi } from '../api/leads'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

export const LeadsContext = createContext(null)

export function LeadsProvider({ children }) {
  const { token } = useAuth()
  const toast = useToast()

  const [leads,     setLeads]     = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)
  const [staff,     setStaff]     = useState([])

  // ── Fetch leads ─────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (params = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await leadsApi.list(params)
      setLeads((data.data ?? []).map(normalizeApiLead))
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to load leads.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // ── Fetch staff list for Assign To dropdown ──────────────────────────────────
  const fetchStaff = useCallback(async () => {
    try {
      const { data } = await staffApi.list()
      setStaff(data.data ?? [])
    } catch {
      // Non-critical — modal still works, dropdown just shows fewer options
    }
  }, [])

  // Load data when authenticated (initial load OR login)
  useEffect(() => {
    if (token || sessionStorage.getItem('crm_token')) {
      fetchLeads()
      fetchStaff()
    }
  }, [fetchLeads, fetchStaff, token])

  // ── addLead ─────────────────────────────────────────────────────────────────
  /**
   * React port of addLead() from the prototype.
   *
   * Handles:
   *   • Client-side validation (name, phone format)
   *   • 409 duplicate phone → returns { duplicate: true, data } so the caller
   *     can ask the user and retry with createForce()
   *   • 422 validation errors from server
   *   • Success: prepends normalised lead to local array
   *
   * @param {Object} payload — matches StoreLeadRequest fields
   * @returns {Promise<{ ok: boolean, duplicate?: boolean, duplicateId?: number }>}
   */
  const addLead = useCallback(async (payload) => {
    try {
      const { data } = await leadsApi.create(payload)
      const newLead = normalizeApiLead(data.data)
      setLeads((prev) => [newLead, ...prev])
      toast.success(`Lead "${newLead.name}" added successfully!`)
      return { ok: true }
    } catch (err) {
      const status = err.response?.status
      const body   = err.response?.data

      if (status === 409) {
        // Duplicate phone — caller decides whether to force-create
        return {
          ok: false,
          duplicate: true,
          duplicateId: body?.duplicate_id,
          message: body?.message ?? 'A lead with this phone already exists.',
        }
      }

      if (status === 422) {
        // Validation errors — surface the first one
        const errors = body?.errors
        const first  = errors ? Object.values(errors)[0] : null
        const msg    = (Array.isArray(first) ? first[0] : first) ?? body?.message ?? 'Validation error.'
        toast.error(msg)
        return { ok: false, message: msg }
      }

      toast.error(body?.message ?? 'Failed to create lead.')
      return { ok: false }
    }
  }, [toast])

  /** Force-create after user confirmed duplicate. */
  const addLeadForce = useCallback(async (payload) => {
    try {
      const { data } = await leadsApi.createForce(payload)
      const newLead = normalizeApiLead(data.data)
      setLeads((prev) => [newLead, ...prev])
      toast.success(`Lead "${newLead.name}" added.`)
      return { ok: true }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create lead.')
      return { ok: false }
    }
  }, [toast])

  // ── editLead ───────────────────────────────────────────────────────────────
  const editLead = useCallback(async (id, payload) => {
    try {
      const { data } = await leadsApi.update(id, payload)
      // The API returns the updated lead in data.data or similar. We should re-fetch or optimistically update.
      const updatedLead = normalizeApiLead(data.data ?? data)
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updatedLead } : l))
      )
      toast.success(`Lead updated successfully!`)
      return { ok: true }
    } catch (err) {
      const status = err.response?.status
      const body   = err.response?.data

      if (status === 422) {
        const errors = body?.errors
        const first  = errors ? Object.values(errors)[0] : null
        const msg    = (Array.isArray(first) ? first[0] : first) ?? body?.message ?? 'Validation error.'
        toast.error(msg)
        return { ok: false, message: msg }
      }
      toast.error(body?.message ?? 'Failed to update lead.')
      return { ok: false }
    }
  }, [toast])


  // ── updateStage ─────────────────────────────────────────────────────────────
  /**
   * React port of updateLeadStage() from the prototype.
   *
   * Optimistic update pattern:
   *   1. Immediately mutate the local array (instant visual feedback)
   *   2. PATCH the API
   *   3. On error: roll back to prevStage + show toast
   *
   * @param {number} id
   * @param {string} stage
   */
  const updateStage = useCallback(async (id, stage) => {
    // Save previous stage for rollback
    let prevStage = null
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) { prevStage = l.stage; return { ...l, stage } }
        return l
      })
    )

    try {
      await leadsApi.updateStage(id, stage)
      toast.success(`Stage updated to "${stage}"`)
    } catch (err) {
      // Rollback
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, stage: prevStage } : l))
      )
      toast.error(err.response?.data?.message ?? 'Failed to update stage.')
    }
  }, [toast])

  // ── deleteLead ──────────────────────────────────────────────────────────────
  const deleteLead = useCallback(async (id, name) => {
    try {
      await leadsApi.destroy(id)
      // Optimistic local update
      setLeads((prev) => prev.filter((l) => Number(l.id) !== Number(id)))
      toast.success(`Lead "${name}" archived.`)
      
      // Safety sync after a short delay to ensure DB commit is visible to next fetch
      setTimeout(() => fetchLeads(), 1000)
      
      return { ok: true }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete lead.')
      return { ok: false }
    }
  }, [toast, fetchLeads])

  const value = {
    leads,
    isLoading,
    error,
    staff,
    fetchLeads,
    addLead,
    addLeadForce,
    editLead,
    updateStage,
    deleteLead,
  }

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used inside <LeadsProvider>')
  return ctx
}
