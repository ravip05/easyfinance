/**
 * context/ToastContext.jsx
 *
 * React port of showToast() from LoanCRM_v9.html.
 *
 * Usage:
 *   const toast = useToast()
 *   toast.success('Lead added!')
 *   toast.error('Something went wrong.')
 *   toast.info('Syncing…')
 *
 * The <ToastContainer /> component must be rendered once at the root level.
 * It is already included in main.jsx via the ToastProvider wrapper.
 */
import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

let _nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'info') => {
    const id = _nextId++
    setToasts((prev) => [...prev, { id, msg, type }])

    // Auto-dismiss after 3 s (matching the prototype's setTimeout)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ── Toast container UI ────────────────────────────────────────────────────────
// Direct port of the .toast-container + .toast HTML from the prototype.
const ICONS = { success: '✅', error: '❌', info: 'ℹ️' }

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => onRemove(t.id)}
          role="alert"
          style={{ cursor: 'pointer' }}
        >
          <span>{ICONS[t.type] ?? '📌'}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
