/**
 * components/BulkAllocationModal.jsx
 *
 * CSV drag-and-drop upload for bulk lead import + weighted allocation.
 * Calls POST /api/hr/allocate-bulk on the backend.
 *
 * Props:
 *   isOpen   — boolean
 *   onClose  — function
 *   onSuccess — function called with { imported_count } on success
 */
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import apiClient from '../api/client'

const TEMPLATE_HEADERS = 'Name,Phone,Email,Loan Type,Amount,Priority'
const TEMPLATE_ROWS = [
  'Rahul Sharma,9876543210,rahul@example.com,Personal,150000,High',
  'Priya Patel,8765432109,priya@example.com,Home,2500000,Medium',
  'Amit Kumar,7654321098,,Business,500000,Low',
]

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS, ...TEMPLATE_ROWS].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'bulk_leads_template.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function BulkAllocationModal({ isOpen, onClose, onSuccess }) {
  const [file,        setFile]        = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result,      setResult]      = useState(null) // { count } on success
  const [error,       setError]       = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    setError('')
    setResult(null)
    if (rejected.length) {
      setError('Only CSV files are accepted (max 5 MB).')
      return
    }
    setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv', '.txt'] },
    maxSize: 5 * 1024 * 1024, // 5 MB
    multiple: false,
  })

  async function handleUpload() {
    if (!file || isUploading) return
    setIsUploading(true)
    setError('')
    setResult(null)

    const form = new FormData()
    form.append('csv_file', file)

    try {
      const res = await apiClient.post('/hr/allocate-bulk', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const count = res.data?.data?.imported_count ?? 0
      setResult(count)
      onSuccess?.({ imported_count: count })
    } catch (err) {
      setError(
        err.response?.data?.errors?.csv_file ??
        err.response?.data?.message ??
        'Upload failed. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  function handleClose() {
    setFile(null); setResult(null); setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={handleClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">📤 Bulk Lead Allocation</div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Info */}
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
            Upload a CSV file. Leads will be automatically distributed to <strong>active staff</strong>{' '}
            using <strong>weighted round-robin</strong> based on seniority tier.
            Max 500+ rows — processing is memory-safe and transactional.
          </div>

          {/* Template download */}
          <button
            onClick={downloadTemplate}
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
          >
            ⬇ Download CSV Template
          </button>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10,
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive ? 'rgba(99,102,241,0.07)' : 'var(--bg2)',
              transition: 'all 0.2s',
            }}
          >
            <input {...getInputProps()} id="bulk-alloc-file-input" />
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            {file ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{file.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {(file.size / 1024).toFixed(1)} KB — click or drag to replace
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {isDragActive ? 'Drop it here…' : 'Drag & drop CSV file'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  or click to browse — max 5 MB
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ef4444',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Success */}
          {result !== null && (
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#10b981',
            }}>
              ✅ Successfully imported and allocated <strong>{result}</strong> leads!
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!file || isUploading || result !== null}
              id="bulk-alloc-upload-btn"
            >
              {isUploading ? 'Uploading…' : result !== null ? 'Done ✓' : 'Upload & Allocate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
