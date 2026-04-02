import React, { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function Tickets() {
  const { user } = useAuth()
  const toast = useToast()
  const role = user?.role ?? 'staff'
  const isAdminOrManager = ['admin', 'manager'].includes(role)
  
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newReply, setNewReply] = useState('')
  const [employees, setEmployees] = useState([]) // For assignment

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Technical',
    priority: 'Medium',
    description: ''
  })

  useEffect(() => {
    fetchTickets()
    if (isAdminOrManager) fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees')
      setEmployees(res.data.data || [])
    } catch {}
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/tickets')
      setTickets(res.data.data?.data || res.data.data || [])
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/tickets', newTicket)
      toast.success('Ticket created successfully')
      setShowModal(false)
      fetchTickets()
      setNewTicket({ subject: '', category: 'Technical', priority: 'Medium', description: '' })
    } catch (err) {
      toast.error('Failed to create ticket')
    }
  }

  const handleReply = async () => {
    if (!newReply.trim()) return
    try {
      await apiClient.post(`/tickets/${selectedTicket.id}/reply`, { message: newReply })
      setNewReply('')
      // Refresh selected ticket
      const res = await apiClient.get(`/tickets/${selectedTicket.id}`)
      setSelectedTicket(res.data.data)
      fetchTickets()
    } catch (err) {
      toast.error('Failed to send reply')
    }
  }

  const handleAdminUpdate = async (field, value) => {
    try {
      await apiClient.put(`/tickets/${selectedTicket.id}`, { [field]: value })
      toast.success('Ticket updated')
      const res = await apiClient.get(`/tickets/${selectedTicket.id}`)
      setSelectedTicket(res.data.data)
      fetchTickets()
    } catch { toast.error('Update failed') }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return <span className="badge badge-new">Open</span>
      case 'In Progress': return <span className="badge badge-processing">In Progress</span>
      case 'Resolved': return <span className="badge badge-sanction">Resolved</span>
      case 'Closed': return <span className="badge badge-closed">Closed</span>
      default: return <span className="badge">{status}</span>
    }
  }

  return (
    <div id="page-tickets" className="page active">
      <div className="card-header">
        <div>
          <h2 className="card-title">🎫 Support Tickets</h2>
          <p className="card-sub">Need help? Raise a ticket or track existing ones.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Ticket
        </button>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr' }}>
        {/* Ticket List */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} onClick={() => setSelectedTicket(t)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="td-name">
                        <div style={{ fontWeight: 600 }}>{t.subject}</div>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>#{t.id} • {new Date(t.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>{t.category}</td>
                    <td>
                      <span className={`badge ${t.priority === 'High' ? 'badge-high' : t.priority === 'Medium' ? 'badge-med' : 'badge-low'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }}>View</button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && !loading && (
                  <tr><td colSpan="5" className="empty">No tickets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversation View */}
        {selectedTicket && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div className="card-header" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {selectedTicket.subject}
                  <button className="modal-close" onClick={() => setSelectedTicket(null)}>✕</button>
                </h3>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  {getStatusBadge(selectedTicket.status)}
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Category: {selectedTicket.category}</span>
                  
                  {isAdminOrManager && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      <select 
                        className="form-select" style={{ padding: '2px 6px', fontSize: 11, height: 26 }}
                        value={selectedTicket.assigned_to || ''}
                        onChange={(e) => handleAdminUpdate('assigned_to', e.target.value || null)}
                      >
                        <option value="">Unassigned</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                      <select 
                        className="form-select" style={{ padding: '2px 6px', fontSize: 11, height: 26 }}
                        value={selectedTicket.status}
                        onChange={(e) => handleAdminUpdate('status', e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Awaiting Reply">Awaiting Reply</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <div className="timeline">
                {/* Original Description */}
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: 'var(--accent)' }} />
                  <div className="timeline-title">{selectedTicket.user?.name} (Created)</div>
                  <div className="timeline-time">{new Date(selectedTicket.created_at).toLocaleString()}</div>
                  <div className="timeline-desc" style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, marginTop: 8 }}>
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Replies */}
                {(selectedTicket.replies || []).map(r => (
                  <div className="timeline-item" key={r.id}>
                    <div className="timeline-dot" style={{ borderColor: r.user_id === user?.id ? 'var(--accent)' : 'var(--purple)' }} />
                    <div className="timeline-title">{r.user?.name}</div>
                    <div className="timeline-time">{new Date(r.created_at).toLocaleString()}</div>
                    <div className="timeline-desc" style={{ background: r.user_id === user?.id ? 'var(--accent-light)' : 'var(--purple-light)', padding: 12, borderRadius: 8, marginTop: 8 }}>
                      {r.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
              <div className="form-group" style={{ marginBottom: 10 }}>
                <textarea 
                  className="form-textarea" 
                  placeholder="Type your reply here..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleReply} disabled={!newReply.trim()}>
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Support Ticket</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject <span className="req">*</span></label>
                  <input 
                    type="text" className="form-input" required 
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="e.g. Login issue or Commission query"
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    >
                      <option>Technical</option>
                      <option>Commission</option>
                      <option>Lead Issue</option>
                      <option>Franchise Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description <span className="req">*</span></label>
                  <textarea 
                    className="form-textarea" required
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="Describe your issue in detail..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
