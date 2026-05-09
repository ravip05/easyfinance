/**
 * components/FranchiseModal.jsx
 */
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { franchiseApi } from '../api/franchise'

const EMPTY_FORM = () => ({
  name: '',
  code: 'EFW-',
  owner_name: '',
  city: '',
  commission_rate: 0.03, // 3% default
  status: 'Active',
  type: 'Standard', // Default type
  phone: '',
  email: '',
  address: '',
})

export default function FranchiseModal({ isOpen, onClose, onSuccess, initialData }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      setForm({
        name: initialData.name || '',
        code: initialData.code || '',
        owner_name: initialData.owner_name || '',
        city: initialData.city || '',
        commission_rate: initialData.commission_rate || 0.03, // 3% default
        status: initialData.status || 'Active',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
      })
    } else {
      setForm(EMPTY_FORM())
    }
    setErrors({})
    setIsLoading(false)
    setTimeout(() => nameRef.current?.focus(), 60)
  }, [isOpen, initialData])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.owner_name.trim()) errs.owner_name = 'Owner name is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.commission_rate) errs.commission_rate = 'Required'
    
    // Code validation: EFW-XXX00
    const codeRegex = /^EFW-[A-Z]{3}[0-9]{2}$/
    if (!form.code.trim()) errs.code = 'Code is required'
    else if (!codeRegex.test(form.code)) errs.code = 'Format: EFW-ABC01'
    
    if (form.phone && !/^[0-9]{10}$/.test(form.phone.replace(/[^0-9]/g, ''))) {
      errs.phone = 'Must be 10 digits'
    }
    
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)
    try {
      let res;
      if (initialData) {
        res = await franchiseApi.update(initialData.id, form)
        toast.success(res.data?.message || 'Franchise updated successfully')
      } else {
        res = await franchiseApi.create(form)
        toast.success(res.data?.message || 'Franchise created successfully')
      }
      onSuccess?.()
      onClose?.()
    } catch (e) {
      console.error('Franchise save error:', e)
      const body = e.response?.data
      if (body?.errors) setErrors(body.errors)
      
      const errMsg = body?.message || (e.response?.status === 422 ? 'Validation failed. Check the form.' : 'Failed to save franchise')
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">🤝 {initialData ? 'Edit Franchise' : 'Onboard New Franchise'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div className="form-label">Franchise / Branch Name <span className="req">*</span></div>
              <input 
                ref={nameRef}
                className={`form-input ${errors.name ? 'error' : ''}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Mumbai Borivali Branch"
              />
            </div>

            <div className="form-group">
              <div className="form-label">Franchise Code <span className="req">*</span></div>
              <input 
                className={`form-input ${errors.code ? 'error' : ''}`}
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="EFW-MUM01"
              />
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>Format: EFW-ABC01</div>
            </div>

            <div className="form-group">
              <div className="form-label">Owner Name <span className="req">*</span></div>
              <input 
                className={`form-input ${errors.owner_name ? 'error' : ''}`}
                name="owner_name"
                value={form.owner_name}
                onChange={handleChange}
                placeholder="Owner Full Name"
              />
            </div>

            <div className="form-group">
              <div className="form-label">City <span className="req">*</span></div>
              <input 
                className={`form-input ${errors.city ? 'error' : ''}`}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ex: Mumbai"
              />
            </div>

            <div className="form-group">
              <div className="form-label">Commission Rate (0-0.05) <span className="req">*</span></div>
              <input 
                className="form-input"
                type="number"
                step="0.001"
                min="0"
                max="0.05"
                name="commission_rate"
                value={form.commission_rate}
                onChange={handleChange}
              />
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>Max: 0.05 (5%)</div>
            </div>

            <div className="form-group">
              <div className="form-label">Franchise Type</div>
              <select 
                className="form-select"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="Standard">Standard</option>
                <option value="Master">Master</option>
                <option value="Partner">Partner</option>
              </select>
            </div>

            <div className="form-group">
              <div className="form-label">Contact Phone</div>
              <input 
                className="form-input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10 digits"
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <div className="form-label">Contact Email</div>
              <input 
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div className="form-label">Office Address</div>
              <textarea 
                className="form-input"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                placeholder="Full office address..."
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : (initialData ? '✓ Save Changes' : '✓ Onboard Franchise')}
          </button>
        </div>
      </div>
    </div>
  )
}
