/**
 * components/LeadModal.jsx
 *
 * React port of the #modal-lead HTML + addLead() JS from LoanCRM_v9.html.
 *
 * Features preserved from the prototype:
 *   ✓ All 10 form fields: name, phone, email, loan_type, amount, source,
 *     assigned_to, priority, follow_up_date, monthly_income, notes
 *   ✓ Default follow-up date = today + 7 days (set in refreshLeadModal)
 *   ✓ Role-based Assign To dropdown:
 *       admin   → all staff from /api/staff
 *       manager → self + team members
 *       staff   → self only (select disabled)
 *       dsa     → own name + "(DSA)" (select disabled)
 *   ✓ Client-side validation: name required, phone 10 digits
 *   ✓ 409 duplicate-phone handling: confirm dialog → force-create
 *   ✓ Server-side 422 error display
 *   ✓ Loading state on submit button ("Saving…")
 *   ✓ Form reset after success
 *   ✓ Escape key closes modal
 *   ✓ All original CSS class names preserved
 *
 * Props:
 *   isOpen   bool    — controls visibility
 *   onClose  fn      — called when modal should close
 *   onSuccess fn     — called after a lead is successfully created
 */
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeads } from '../context/LeadsContext'
import { useToast } from '../context/ToastContext'

// ── Constants ─────────────────────────────────────────────────────────────────
const LOAN_TYPES = ['Home Loan', 'Business Loan', 'Personal Loan', 'Car Loan', 'LAP', 'Insurance']
const SOURCES    = ['Direct', 'Website', 'Referral', 'DSA Partner', 'Social Media', 'Walk-in']
const PRIORITIES = ['High', 'Medium', 'Low']
const INCOME_STATUSES = ['Salaried', 'Self-Employed', 'Business', 'Retired', 'Other']

const DEFAULT_FOLLOWUP = () => {
  const d = new Date(Date.now() + 7 * 86_400_000)
  return d.toISOString().split('T')[0]
}

const EMPTY_FORM = () => ({
  name:           '',
  phone:          '',
  email:          '',
  birth_date:     '',
  location:       '',
  loan_type:      'Home Loan',
  amount:         '',
  source:         'Direct',
  assigned_to:    '',
  priority:       'Medium',
  follow_up_date: DEFAULT_FOLLOWUP(),
  follow_up_time: '',
  monthly_income: '',
  income_status:  '',
  running_loans:  '',
  previous_issues:'',
  cibil_score:    '',
  lead_value:     '',
  notes:          '',
})

// ── Component ─────────────────────────────────────────────────────────────────
export default function LeadModal({ isOpen, onClose, onSuccess, initialData }) {
  const { user }                          = useAuth()
  const { staff, addLead, addLeadForce, editLead }  = useLeads()
  const toast                             = useToast()

  const [form,      setForm]      = useState(EMPTY_FORM)
  const [errors,    setErrors]    = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const nameRef = useRef(null)

  const role = user?.role ?? 'staff'

  // ── Build the options for the Assign To dropdown ──────────────────────────
  // Mirrors refreshLeadModal() from the prototype.
  const assignOptions = (() => {
    if (role === 'admin') {
      // Admin sees all staff from /api/staff
      return [
        ...staff.map((s) => ({ id: s.id, label: s.name })),
        { id: '', label: 'Unassigned' },
      ]
    }
    if (role === 'manager') {
      // Manager sees self + team members
      const team = [
        { id: user.id, label: user.name },
        ...(user.team_members ?? []).map((m) => ({ id: m.id, label: m.name })),
        { id: '', label: 'Unassigned' },
      ]
      return team
    }
    if (role === 'staff') {
      return [{ id: user.id, label: user.name }]
    }
    // dsa
    return [{ id: user.id, label: `${user.name} (DSA)` }]
  })()

  const assignDisabled = role === 'staff' || role === 'dsa'

  // ── When modal opens: reset form + set sensible defaults ──────────────────
  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setForm({
        name:           initialData.name ?? '',
        phone:          initialData.phone ?? '',
        email:          initialData.email ?? '',
        birth_date:     initialData._raw?.birth_date ?? '',
        location:       initialData._raw?.location ?? '',
        loan_type:      initialData.type ?? 'Home Loan',
        amount:         initialData.amountRaw ?? '',
        source:         initialData.source ?? 'Direct',
        assigned_to:    initialData.assignedId ?? assignOptions[0]?.id ?? '',
        priority:       initialData.priority ?? 'Medium',
        follow_up_date: initialData._raw?.follow_up_date ?? DEFAULT_FOLLOWUP(),
        follow_up_time: initialData._raw?.follow_up_time ?? '',
        monthly_income: initialData._raw?.monthly_income ?? '',
        income_status:  initialData._raw?.income_status ?? '',
        running_loans:  initialData._raw?.running_loans ?? '',
        previous_issues:initialData._raw?.previous_issues ?? '',
        cibil_score:    initialData._raw?.cibil_score ?? '',
        lead_value:     initialData._raw?.lead_value ?? '',
        notes:          initialData.notes ?? '',
      })
    } else {
      // Default assigned_to = current user's id (mirrors refreshLeadModal)
      const defaultAssign = assignOptions[0]?.id ?? ''
      setForm({ ...EMPTY_FORM(), assigned_to: defaultAssign, follow_up_date: DEFAULT_FOLLOWUP() })
    }
    
    setErrors({})
    setIsLoading(false)

    // Auto-focus the name field
    setTimeout(() => nameRef.current?.focus(), 60)
  }, [isOpen, initialData]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Escape key closes modal ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Field change handler ───────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Full name is required.'
    const phone = form.phone.replace(/[^0-9]/g, '')
    if (!phone)             errs.phone = 'Mobile number is required.'
    else if (phone.length !== 10) errs.phone = 'Enter a valid 10-digit mobile number.'
    return errs
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)

    const payload = {
      name:            form.name.trim(),
      phone:           form.phone.replace(/[^0-9]/g, ''),
      email:           form.email.trim() || undefined,
      birth_date:      form.birth_date || undefined,
      location:        form.location.trim() || undefined,
      loan_type:       form.loan_type,
      amount:          form.amount ? parseFloat(form.amount) : undefined,
      source:          form.source,
      assigned_to:     form.assigned_to || undefined,
      priority:        form.priority,
      follow_up_date:  form.follow_up_date || undefined,
      follow_up_time:  form.follow_up_time || undefined,
      monthly_income:  form.monthly_income ? parseFloat(form.monthly_income) : undefined,
      income_status:   form.income_status || undefined,
      running_loans:   form.running_loans ? parseInt(form.running_loans) : undefined,
      previous_issues: form.previous_issues.trim() || undefined,
      cibil_score:     form.cibil_score ? parseInt(form.cibil_score) : undefined,
      lead_value:      form.lead_value ? parseFloat(form.lead_value) : undefined,
      notes:           form.notes.trim() || undefined,
    }

    if (initialData) {
      const result = await editLead(initialData.id, payload)
      if (result.ok) {
        onSuccess?.()
        onClose()
      }
      setIsLoading(false)
      return
    }

    const result = await addLead(payload)

    if (result.ok) {
      onSuccess?.()
      onClose()
      return
    }

    if (result.duplicate) {
      setIsLoading(false)
      // Mirror the prototype's confirm() dialog for duplicate phone
      const confirmed = window.confirm(
        `${result.message}\n\nAdd anyway?`
      )
      if (confirmed) {
        setIsLoading(true)
        const forceResult = await addLeadForce(payload)
        if (forceResult.ok) { onSuccess?.(); onClose(); return }
      }
    }

    setIsLoading(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!isOpen) return null

  return (
    <div className="modal-overlay open" id="modal-lead">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-lead-title">

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-title" id="modal-lead-title">{initialData ? '✏️ Edit Lead' : '🎯 Add New Lead'}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <div className="form-grid">

            {/* Full Name */}
            <div className="form-group">
              <div className="form-label">
                Full Name <span className="req">*</span>
              </div>
              <input
                ref={nameRef}
                className={`form-input${errors.name ? ' error' : ''}`}
                placeholder="Client Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.name && <FieldError msg={errors.name} />}
            </div>

            {/* Mobile */}
            <div className="form-group">
              <div className="form-label">
                Mobile <span className="req">*</span>
              </div>
              <input
                className={`form-input${errors.phone ? ' error' : ''}`}
                placeholder="9876543210"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={12}
              />
              {errors.phone && <FieldError msg={errors.phone} />}
            </div>

            {/* Email */}
            <div className="form-group">
              <div className="form-label">Email</div>
              <input
                className="form-input"
                type="email"
                placeholder="client@email.com"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* Loan Type */}
            <div className="form-group">
              <div className="form-label">
                Loan Type <span className="req">*</span>
              </div>
              <select
                className="form-select"
                name="loan_type"
                value={form.loan_type}
                onChange={handleChange}
                id="nl-type"
              >
                {LOAN_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Loan Amount */}
            <div className="form-group">
              <div className="form-label">Loan Amount (₹)</div>
              <input
                className="form-input"
                type="number"
                placeholder="2500000"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                id="nl-amount"
              />
            </div>

            {/* Lead Source */}
            <div className="form-group">
              <div className="form-label">Lead Source</div>
              <select
                className="form-select"
                name="source"
                value={form.source}
                onChange={handleChange}
              >
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Assign To */}
            <div className="form-group">
              <div className="form-label">Assign To</div>
              <select
                className="form-select"
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                disabled={assignDisabled}
                id="nl-assign"
              >
                {assignOptions.map((o) => (
                  <option key={o.id ?? 'unassigned'} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <div className="form-label">Priority</div>
              <select
                className="form-select"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                id="nl-priority"
              >
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Follow-up Date */}
            <div className="form-group">
              <div className="form-label">Follow-up Date</div>
              <input
                className="form-input"
                type="date"
                name="follow_up_date"
                value={form.follow_up_date}
                onChange={handleChange}
                id="nl-followup"
              />
            </div>

            {/* Monthly Income */}
            <div className="form-group">
              <div className="form-label">Monthly Income (₹)</div>
              <input
                className="form-input"
                type="number"
                placeholder="75000"
                name="monthly_income"
                value={form.monthly_income}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Birth Date */}
            <div className="form-group">
              <div className="form-label">Birth Date</div>
              <input
                className="form-input"
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                id="nl-birthdate"
              />
              {form.birth_date && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                  Age: {Math.floor((Date.now() - new Date(form.birth_date)) / 31557600000)} years
                </div>
              )}
            </div>

            {/* Location */}
            <div className="form-group">
              <div className="form-label">Location</div>
              <input
                className="form-input"
                placeholder="City, State"
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            {/* Income Status */}
            <div className="form-group">
              <div className="form-label">Income Status</div>
              <select
                className="form-select"
                name="income_status"
                value={form.income_status}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {INCOME_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Running Loans */}
            <div className="form-group">
              <div className="form-label">Running Loans</div>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                name="running_loans"
                value={form.running_loans}
                onChange={handleChange}
                min="0"
                max="20"
              />
            </div>

            {/* CIBIL Score */}
            <div className="form-group">
              <div className="form-label">CIBIL Score</div>
              <input
                className="form-input"
                type="number"
                placeholder="750"
                name="cibil_score"
                value={form.cibil_score}
                onChange={handleChange}
                min="300"
                max="900"
              />
            </div>

            {/* Lead Value */}
            <div className="form-group">
              <div className="form-label">Lead Value (₹)</div>
              <input
                className="form-input"
                type="number"
                placeholder="50000"
                name="lead_value"
                value={form.lead_value}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Follow-up Time */}
            <div className="form-group">
              <div className="form-label">Follow-up Time</div>
              <input
                className="form-input"
                type="time"
                name="follow_up_time"
                value={form.follow_up_time}
                onChange={handleChange}
                id="nl-followup-time"
              />
            </div>

          </div>{/* /form-grid */}

          {/* Previous Issues — full width */}
          <div className="form-group">
            <div className="form-label">Previous Issues</div>
            <textarea
              className="form-textarea"
              placeholder="Any previous loan issues, rejections, CIBIL problems..."
              name="previous_issues"
              value={form.previous_issues}
              onChange={handleChange}
              style={{ minHeight: 60 }}
            />
          </div>

          {/* Notes — full width */}
          <div className="form-group">
            <div className="form-label">Notes</div>
            <textarea
              className="form-textarea"
              placeholder="Additional information about this lead..."
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

        </div>{/* /modal-body */}

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : (initialData ? '✓ Save Changes' : '✓ Add Lead')}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Sub-component: inline field error ─────────────────────────────────────────
function FieldError({ msg }) {
  return (
    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>
      {msg}
    </div>
  )
}
