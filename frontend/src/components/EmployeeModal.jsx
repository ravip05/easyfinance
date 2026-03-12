/**
 * components/EmployeeModal.jsx
 *
 * Modal for adding a new staff member (admin/manager/staff).
 */
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { employeesApi } from '../api/leads'

const ROLES = [
  { value: 'staff', label: 'Staff / Field Executive' },
  { value: 'manager', label: 'Manager / Team Lead' },
  { value: 'admin', label: 'Super Admin' },
]

const DEPARTMENTS = ['Sales', 'Operations', 'Finance', 'HR', 'IT', 'Marketing', 'General']

const EMPTY_FORM = () => ({
  name: '',
  email: '',
  phone: '',
  role: 'staff',
  department: 'Sales',
  team_leader_id: '',
  joining_date: new Date().toISOString().split('T')[0],
  commission_rate: 0,
})

export default function EmployeeModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const toast = useToast()
  
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [managers, setManagers] = useState([])
  
  const nameRef = useRef(null)

  // Fetch potential managers for the "Reports To" list
  useEffect(() => {
    if (!isOpen) return
    employeesApi.list({ role: 'manager' })
      .then(res => setManagers(res.data.data || []))
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setForm(EMPTY_FORM())
    setErrors({})
    setIsLoading(false)
    setTimeout(() => nameRef.current?.focus(), 60)
  }, [isOpen])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    
    const phone = form.phone.replace(/[^0-9]/g, '')
    if (!phone) errs.phone = 'Phone is required'
    else if (phone.length !== 10) errs.phone = 'Must be 10 digits'
    
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)
    try {
      const payload = { ...form }
      if (!payload.team_leader_id) delete payload.team_leader_id
      
      const res = await employeesApi.create(payload)
      toast?.('success', res.data.message || 'Employee created successfully')
      onSuccess?.()
      onClose()
    } catch (e) {
      const status = e.response?.status
      const body = e.response?.data
      
      if (status === 422 && body.errors) {
        setErrors(body.errors)
        const first = Object.values(body.errors)[0]
        toast?.('error', Array.isArray(first) ? first[0] : first)
      } else {
        toast?.('error', body?.message || 'Failed to create employee')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">👤 Add New Employee</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <div className="form-label">Full Name <span className="req">*</span></div>
              <input 
                ref={nameRef}
                className={`form-input ${errors.name ? 'error' : ''}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Rajesh Kumar"
              />
              {errors.name && <div className="field-err">{errors.name}</div>}
            </div>

            <div className="form-group">
              <div className="form-label">Email <span className="req">*</span></div>
              <input 
                className={`form-input ${errors.email ? 'error' : ''}`}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="rajesh@company.com"
              />
              {errors.email && <div className="field-err">{errors.email}</div>}
            </div>

            <div className="form-group">
              <div className="form-label">Phone <span className="req">*</span></div>
              <input 
                className={`form-input ${errors.phone ? 'error' : ''}`}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
              />
              {errors.phone && <div className="field-err">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <div className="form-label">Role <span className="req">*</span></div>
              <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label">Department</div>
              <select className="form-select" name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label">Reports To</div>
              <select className="form-select" name="team_leader_id" value={form.team_leader_id} onChange={handleChange}>
                <option value="">No Manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.emp_code})</option>)}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label">Joining Date</div>
              <input 
                className="form-input"
                name="joining_date"
                type="date"
                value={form.joining_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <div className="form-label">Commission Rate (0-1)</div>
              <input 
                className="form-input"
                name="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.commission_rate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div style={{ marginTop: 15, padding: 10, background: 'var(--bg2)', borderRadius: 8, fontSize: 11, color: 'var(--text3)' }}>
            ℹ️ The default password for this user will be their phone number.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : '✓ Create Employee'}
          </button>
        </div>
      </div>

      <style>{`
        .field-err { color: var(--red); fontSize: 10px; marginTop: 4px; }
      `}</style>
    </div>
  )
}
