/**
 * components/PolicyModal.jsx
 *
 * Modal for publishing a new company policy. Admin only.
 */
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { hrApi } from '../api/hr'

const CATEGORIES = ['General', 'HR', 'IT & Security', 'Code of Conduct', 'Leaves & Attendance', 'Benefits']

const EMPTY_FORM = () => ({
  title: '',
  category: 'General',
  content: '',
  version: '1.0',
  is_active: true,
})

export default function PolicyModal({ isOpen, onClose, onSuccess }) {
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
    if (!form.content.trim()) errs.content = 'Content is required'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setIsLoading(true)
    try {
      await hrApi.createPolicy(form)
      toast?.('success', 'Policy published successfully')
      onSuccess?.()
      onClose()
    } catch (e) {
      const body = e.response?.data
      toast?.('error', body?.message || 'Failed to publish policy')
      if (body.errors) setErrors(body.errors)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div className="modal-title">📋 Publish Company Policy</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div className="form-label">Policy Title <span className="req">*</span></div>
              <input 
                ref={titleRef}
                className={`form-input ${errors.title ? 'error' : ''}`}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Remote Work Policy"
              />
            </div>

            <div className="form-group">
              <div className="form-label">Category</div>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label">Version</div>
              <input 
                className="form-input"
                name="version"
                value={form.version}
                onChange={handleChange}
                placeholder="Ex: 1.0"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 15 }}>
            <div className="form-label">Policy Content <span className="req">*</span></div>
            <textarea 
              className={`form-input ${errors.content ? 'error' : ''}`}
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={8}
              placeholder="Paste the full policy text here..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Publishing...' : '✓ Publish Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}
