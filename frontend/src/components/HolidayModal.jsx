/**
 * components/HolidayModal.jsx
 *
 * Modal for adding a new holiday. Admin only.
 */
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { hrApi } from '../api/hr'

const HOLIDAY_TYPES = ['Public Holiday', 'Company Holiday', 'Regional Holiday', 'Other']

const EMPTY_FORM = () => ({
  title: '',
  date: new Date().toISOString().split('T')[0],
  type: 'Public Holiday',
  is_optional: false,
})

export default function HolidayModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(EMPTY_FORM())
    setErrors({})
    setIsLoading(false)
    setTimeout(() => titleRef.current?.focus(), 60)
  }, [isOpen])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.date) errs.date = 'Date is required'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)
    try {
      await hrApi.createHoliday(form)
      toast?.('success', 'Holiday added successfully')
      onSuccess?.()
      onClose()
    } catch (e) {
      const body = e.response?.data
      toast?.('error', body?.message || 'Failed to add holiday')
      if (body.errors) setErrors(body.errors)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-title">📅 Add New Holiday</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <div className="form-label">Holiday Title <span className="req">*</span></div>
            <input 
              ref={titleRef}
              className={`form-input ${errors.title ? 'error' : ''}`}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Diwali, Independence Day"
            />
          </div>

          <div className="form-group">
            <div className="form-label">Date <span className="req">*</span></div>
            <input 
              className="form-input"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div className="form-label">Type</div>
            <select className="form-select" name="type" value={form.type} onChange={handleChange}>
              {HOLIDAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <input 
              type="checkbox"
              id="is_optional"
              name="is_optional"
              checked={form.is_optional}
              onChange={handleChange}
            />
            <label htmlFor="is_optional" style={{ fontSize: 13, cursor: 'pointer' }}>
              This is an optional / restricted holiday
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : '✓ Add Holiday'}
          </button>
        </div>
      </div>
    </div>
  )
}
