/**
 * pages/Announcements.jsx
 *
 * Notice board with admin broadcast form.
 * Fixed: field mapping to match AnnouncementController expectations,
 * user source from sessionStorage, and API path without double /api/ prefix.
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

export default function Announcements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all',
    priority: 'normal',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/announcements')
      setAnnouncements(data?.data ?? [])
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg('')
    try {
      const res = await apiClient.post('/announcements', form)
      if (res.data?.success) {
        setSubmitMsg('✅ Announcement broadcast successfully!')
        setForm({ title: '', message: '', target: 'all', priority: 'normal' })
        fetchAnnouncements()
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.errors?.title?.[0] || 'Failed to create announcement.'
      setSubmitMsg(`❌ ${msg}`)
      console.error('Failed to create announcement:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const isNew = (dateString) => {
    const diffDays = Math.ceil(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  const priorityColor = { normal: 'var(--green)', important: 'var(--gold)', urgent: 'var(--red)' }

  return (
    <div id="page-announcements" className="page active">
      {/* Admin/Manager Broadcast Form */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">📢 Broadcast New Announcement</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label">Title <span className="req">*</span></div>
              <input
                className="form-input"
                type="text"
                placeholder="Enter announcement title…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <div className="form-label">Message <span className="req">*</span></div>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Write your announcement message here…"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <div className="form-label">Target Audience</div>
                <select
                  className="form-select"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                >
                  <option value="all">Everyone</option>
                  <option value="staff">Staff Only</option>
                  <option value="manager">Managers Only</option>
                  <option value="dsa">DSA Partners Only</option>
                </select>
              </div>
              <div className="form-group">
                <div className="form-label">Priority</div>
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            {submitMsg && (
              <div style={{
                padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13,
                background: submitMsg.startsWith('✅') ? 'var(--green-light)' : 'var(--red-light)',
                color: submitMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)',
                border: `1px solid ${submitMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
              }}>
                {submitMsg}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: 4 }}
            >
              {submitting ? '📡 Broadcasting…' : '📢 Publish Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* Announcements Feed */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Announcements Feed</div>
          <button className="btn btn-sm btn-ghost" onClick={fetchAnnouncements}>↻ Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading announcements…</div>
        ) : announcements.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No announcements yet.</div>
          </div>
        ) : (
          <div>
            {announcements.map(ann => (
              <div key={ann.id} style={{
                padding: '14px 0', borderBottom: '1px solid var(--border)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                {/* Priority dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: priorityColor[ann.priority] || 'var(--text3)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {ann.title}
                      {isNew(ann.created_at || ann.published_at) && (
                        <span className="badge badge-new" style={{ marginLeft: 8, fontSize: 9 }}>NEW</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>
                      {new Date(ann.created_at || ann.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                    {ann.message || ann.content}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                    Target: {ann.target === 'all' ? 'Everyone' : ann.target} · Priority: {ann.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
