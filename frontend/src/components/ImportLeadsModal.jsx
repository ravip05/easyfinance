/**
 * components/ImportLeadsModal.jsx
 *
 * Drag-and-drop CSV/Excel import modal.
 * Hits POST /api/hr/allocate-bulk (multipart/form-data, field: csv_file).
 *
 * Style: Inter font, 8px grid spacing, 48px touch targets.
 */
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import apiClient from '../services/apiClient'

export default function ImportLeadsModal({ isOpen, onClose, onSuccess }) {
  const [file,      setFile]      = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result,    setResult]    = useState(null)   // { imported_count }
  const [error,     setError]     = useState('')

  // ── Dropzone ──────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    if (accepted.length) {
      setFile(accepted[0])
      setError('')
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'] },
    multiple: false,
    disabled: isLoading,
  })

  if (!isOpen) return null

  function handleClose() {
    if (isLoading) return
    setFile(null); setError(''); setResult(null)
    onClose?.()
  }

  async function handleUpload() {
    if (!file || isLoading) return
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const form = new FormData()
      form.append('csv_file', file)
      const { data } = await apiClient.post('/hr/allocate-bulk', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data.data)
      onSuccess?.()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.csv_file?.[0] ||
        'Upload failed. Check the CSV format and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ── Inline styles ──────────────────────────────────────────────────────────
  const S = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 16, fontFamily: 'Inter, sans-serif',
    },
    card: {
      background: 'var(--bg, #fff)', borderRadius: 16, width: '100%',
      maxWidth: 460, boxShadow: '0 24px 48px rgba(0,0,0,0.2)', overflow: 'hidden',
    },
    header: {
      padding: '24px 24px 16px', borderBottom: '1px solid var(--border, #e2e8f0)',
    },
    title: { margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text, #0f172a)' },
    sub:   { margin: '4px 0 0', fontSize: 13, color: 'var(--text2, #64748b)' },
    body:  { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    dropzone: {
      border: `2px dashed ${isDragActive ? '#2563eb' : 'var(--border, #cbd5e1)'}`,
      borderRadius: 12,
      padding: 32,
      textAlign: 'center',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      background: isDragActive ? '#eff6ff' : 'var(--bg2, #f8fafc)',
      transition: 'border-color 0.15s, background 0.15s',
    },
    dropIcon:  { fontSize: 36, marginBottom: 8 },
    dropText:  { fontSize: 14, color: 'var(--text2, #64748b)', lineHeight: 1.5 },
    fileChip: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 8,
      background: '#eff6ff', border: '1px solid #bfdbfe',
    },
    fileName:  { flex: 1, fontSize: 13, fontWeight: 500, color: '#1d4ed8', wordBreak: 'break-all' },
    removeBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 16, color: '#64748b', lineHeight: 1,
    },
    hint: {
      fontSize: 12, color: 'var(--text3, #94a3b8)', lineHeight: 1.6,
    },
    error: {
      padding: '10px 14px', borderRadius: 8, background: '#fef2f2',
      color: '#dc2626', fontSize: 13, fontWeight: 500,
    },
    success: {
      padding: '10px 14px', borderRadius: 8, background: '#f0fdf4',
      color: '#16a34a', fontSize: 14, fontWeight: 600,
    },
    spinner: {
      width: 20, height: 20, border: '3px solid #bfdbfe',
      borderTop: '3px solid #2563eb', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', display: 'inline-block',
      verticalAlign: 'middle', marginRight: 8,
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
    btnUpload: {
      minHeight: 48, padding: '0 24px', fontFamily: 'Inter, sans-serif',
      fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8,
      background: file && !isLoading ? '#2563eb' : '#93c5fd',
      color: '#fff', cursor: file && !isLoading ? 'pointer' : 'not-allowed',
    },
  }

  return (
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.card}>

        {/* Header */}
        <div style={S.header}>
          <p style={S.title}>⬆ Import Leads from CSV</p>
          <p style={S.sub}>Upload a CSV file — leads are auto-allocated to active staff</p>
        </div>

        <div style={S.body}>

          {/* Success state */}
          {result && (
            <div style={S.success}>
              ✅ Successfully imported <strong>{result.imported_count}</strong> leads!
            </div>
          )}

          {/* Error */}
          {error && <div role="alert" style={S.error}>{error}</div>}

          {/* Dropzone */}
          {!result && (
            <div {...getRootProps()} style={S.dropzone}>
              <input {...getInputProps()} id="import-csv-input" />
              <div style={S.dropIcon}>{isDragActive ? '📂' : '📄'}</div>
              <div style={S.dropText}>
                {isDragActive
                  ? 'Drop the CSV file here'
                  : 'Drag & drop a CSV file, or click to browse'}
              </div>
            </div>
          )}

          {/* File chip */}
          {file && !result && (
            <div style={S.fileChip}>
              <span>📎</span>
              <span style={S.fileName}>{file.name}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
              {!isLoading && (
                <button
                  type="button"
                  style={S.removeBtn}
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Format hint */}
          {!result && (
            <p style={S.hint}>
              Required columns: <code>Name, Phone, Loan Type, Amount, Priority</code><br />
              Optional: <code>Email</code> — max 5 MB, .csv or .txt
            </p>
          )}

          {/* Spinner */}
          {isLoading && (
            <div style={{ textAlign: 'center', color: '#2563eb', fontSize: 14 }}>
              <span style={S.spinner} />
              Processing file, please wait…
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={S.footer}>
          <button type="button" style={S.btnCancel} onClick={handleClose} disabled={isLoading}>
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              style={S.btnUpload}
              disabled={!file || isLoading}
              onClick={handleUpload}
            >
              {isLoading ? 'Uploading…' : '⬆ Upload & Allocate'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
