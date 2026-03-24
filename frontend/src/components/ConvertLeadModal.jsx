/**
 * components/ConvertLeadModal.jsx
 *
 * Collects CIBIL score, bank policy, and EMI before firing the
 * POST /api/clients/from-lead/{lead} conversion endpoint.
 *
 * Styling:
 *   - Inter font throughout
 *   - 8px grid spacing (padding multiples of 8)
 *   - 48px min-height on all form controls for mobile touch targets
 */
import { useState, useEffect } from 'react'
import apiClient from '../services/apiClient'

export default function ConvertLeadModal({ lead, isOpen, onClose, onSuccess }) {
  const [bankPolicies, setBankPolicies] = useState([])
  const [form, setForm] = useState({ cibil_score: '', bank_policy_id: '', emi_amount: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch bank policies for the dropdown once on open
  useEffect(() => {
    if (!isOpen) return
    setError('')
    setForm({ cibil_score: '', bank_policy_id: '', emi_amount: '' })
    apiClient.get('/bank-policies?per_page=100')
      .then(({ data }) => setBankPolicies(data.data ?? []))
      .catch(() => { /* non-fatal — user can still submit without a policy */ })
  }, [isOpen])

  if (!isOpen || !lead) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isLoading) return

    const cibil = parseInt(form.cibil_score, 10)
    if (form.cibil_score && (cibil < 300 || cibil > 900)) {
      setError('CIBIL score must be between 300 and 900.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const payload = {}
      if (form.cibil_score)     payload.cibil_score     = cibil
      if (form.bank_policy_id)  payload.bank_policy_id  = parseInt(form.bank_policy_id, 10)
      if (form.emi_amount)      payload.emi_amount       = parseFloat(form.emi_amount)

      await apiClient.post(`/clients/from-lead/${lead.id}`, payload)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[Object.keys(err.response?.data?.errors ?? {})[0]]?.[0] ||
        'Conversion failed. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Styles (inline — no extra CSS file needed) ────────────────────────────
  const S = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 16, fontFamily: 'Inter, sans-serif',
    },
    card: {
      background: 'var(--bg, #fff)', borderRadius: 16, width: '100%',
      maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
      overflow: 'hidden',
    },
    header: {
      padding: '24px 24px 16px', borderBottom: '1px solid var(--border, #e2e8f0)',
    },
    title: { margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text, #0f172a)' },
    sub:   { margin: '4px 0 0', fontSize: 13, color: 'var(--text2, #64748b)' },
    body:  { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500,
             color: 'var(--text2, #64748b)', letterSpacing: '0.02em', textTransform: 'uppercase' },
    input: {
      width: '100%', minHeight: 48, padding: '0 12px', boxSizing: 'border-box',
      fontSize: 14, fontFamily: 'Inter, sans-serif', border: '1.5px solid var(--border, #e2e8f0)',
      borderRadius: 8, background: 'var(--bg, #fff)', color: 'var(--text, #0f172a)',
      outline: 'none', transition: 'border-color 0.15s',
    },
    footer: {
      padding: '16px 24px', borderTop: '1px solid var(--border, #e2e8f0)',
      display: 'flex', gap: 8, justifyContent: 'flex-end',
    },
    btnCancel: {
      minHeight: 48, padding: '0 20px', fontFamily: 'Inter, sans-serif',
      fontSize: 14, fontWeight: 500, border: '1.5px solid var(--border, #e2e8f0)',
      borderRadius: 8, background: 'transparent', cursor: 'pointer',
      color: 'var(--text2, #64748b)',
    },
    btnSubmit: {
      minHeight: 48, padding: '0 24px', fontFamily: 'Inter, sans-serif',
      fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8,
      background: '#2563eb', color: '#fff', cursor: 'pointer',
      opacity: isLoading ? 0.7 : 1,
    },
    error: {
      padding: '10px 14px', borderRadius: 8, background: '#fef2f2',
      color: '#dc2626', fontSize: 13, fontWeight: 500,
    },
  }

  return (
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div style={S.card} role="dialog" aria-modal="true" aria-labelledby="convert-modal-title">

        {/* Header */}
        <div style={S.header}>
          <p style={S.title} id="convert-modal-title">🚀 Convert Lead to Client</p>
          <p style={S.sub}>
            Converting <strong>{lead.name}</strong> — fill in Loan & CIBIL details
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={S.body}>

            {error && <div role="alert" style={S.error}>{error}</div>}

            {/* CIBIL Score */}
            <div>
              <label htmlFor="cln-cibil" style={S.label}>CIBIL Score (300–900)</label>
              <input
                id="cln-cibil"
                name="cibil_score"
                type="number"
                min="300"
                max="900"
                placeholder="e.g. 720"
                value={form.cibil_score}
                onChange={handleChange}
                style={S.input}
              />
            </div>

            {/* Bank Policy */}
            <div>
              <label htmlFor="cln-bank" style={S.label}>Bank / Policy</label>
              <select
                id="cln-bank"
                name="bank_policy_id"
                value={form.bank_policy_id}
                onChange={handleChange}
                style={S.input}
              >
                <option value="">-- Select bank policy --</option>
                {bankPolicies.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* EMI Amount */}
            <div>
              <label htmlFor="cln-emi" style={S.label}>EMI Amount (₹)</label>
              <input
                id="cln-emi"
                name="emi_amount"
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 25000"
                value={form.emi_amount}
                onChange={handleChange}
                style={S.input}
              />
            </div>

          </div>

          {/* Footer */}
          <div style={S.footer}>
            <button type="button" style={S.btnCancel} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" style={S.btnSubmit} disabled={isLoading}>
              {isLoading ? 'Converting…' : '🚀 Convert to Client'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
