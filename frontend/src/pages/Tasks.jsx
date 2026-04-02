import React, { useState, useEffect, useRef } from 'react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const PRIORITY_COLORS = { Low: '#94a3b8', Medium: '#3b82f6', High: '#f59e0b', Urgent: '#ef4444' }
const STATUS_COLORS = { Pending: '#64748b', 'In Progress': '#2563eb', Completed: '#059669', Cancelled: '#dc2626' }

const s = {
  page: { fontFamily: "'Inter', sans-serif", padding: 24, maxWidth: 1400, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  kanban: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, minHeight: 500 },
  column: (color) => ({ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', minHeight: 400, display: 'flex', flexDirection: 'column' }),
  colHeader: (color) => ({ padding: '14px 16px', borderBottom: `3px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
  colTitle: { fontSize: 13, fontWeight: 800, letterSpacing: '0.02em' },
  colCount: (color) => ({ fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 99, background: `${color}20`, color }),
  colBody: { flex: 1, padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 },
  card: (isDragging) => ({ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0', cursor: 'grab', boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s, transform 0.15s', transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none' }),
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6, lineHeight: 1.3 },
  cardMeta: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 11, color: '#94a3b8' },
  badge: (bg, color) => ({ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: bg, color, whiteSpace: 'nowrap' }),
  overdue: { fontSize: 10, fontWeight: 800, color: '#ef4444' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' },
  modalHeader: { padding: '18px 22px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 17, fontWeight: 700 },
  modalClose: { background: '#f0f4f9', border: '1px solid #e2e8f0', width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#475569', cursor: 'pointer' },
  modalBody: { padding: '18px 22px' },
  modalFooter: { padding: '12px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, justifyContent: 'flex-end' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 },
  statCard: (bg, color) => ({ background: `linear-gradient(135deg, ${bg} 0%, ${color} 100%)`, borderRadius: 14, padding: '18px 20px', color: '#fff' }),
  dropZone: { border: '2px dashed #cbd5e1', borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s' },
}

export default function Tasks() {
  const toast = useToast()
  const { user } = useAuth()
  const isAdmin = ['admin', 'manager'].includes(user?.role)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [employees, setEmployees] = useState([])
  const dragItem = useRef(null)

  useEffect(() => { fetchTasks(); fetchEmployees() }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/tasks')
      setTasks(res.data.data || [])
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees')
      setEmployees(res.data.data || [])
    } catch {}
  }

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status)
    return acc
  }, {})

  // Kanban stats
  const total = tasks.length
  const overdue = tasks.filter(t => t.is_overdue).length
  const completed = tasks.filter(t => t.status === 'Completed').length

  // ── Drag & Drop ──
  const handleDragStart = (e, task) => {
    dragItem.current = task
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    const task = dragItem.current
    if (!task || task.status === newStatus) return
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    try {
      await apiClient.patch(`/tasks/${task.id}`, { status: newStatus })
      toast.success(`Task → ${newStatus}`)
    } catch {
      toast.error('Failed to update task')
      fetchTasks()
    }
    dragItem.current = null
  }

  // ── Handlers ──
  const handleSave = async (data) => {
    try {
      if (editingTask) {
        await apiClient.patch(`/tasks/${editingTask.id}`, data)
        toast.success('Task updated')
      } else {
        await apiClient.post('/tasks', data)
        toast.success('Task created')
      }
      setShowModal(false); setEditingTask(null); fetchTasks()
    } catch { toast.error('Failed to save task') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try { await apiClient.delete(`/tasks/${id}`); toast.success('Deleted'); fetchTasks() }
    catch { toast.error('Failed to delete') }
  }

  const handleImportCSV = async (file) => {
    const form = new FormData()
    form.append('csv_file', file)
    try {
      const res = await apiClient.post('/tasks/import-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(res.data.message || 'Imported!')
      setShowImport(false); fetchTasks()
    } catch (e) { toast.error(e.response?.data?.message || 'Import failed') }
  }

  const handleExportCSV = async () => {
    try {
      const res = await apiClient.get('/tasks/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error('Failed to export tasks');
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>📋 Task Management</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Assign, track, and manage team tasks with drag-and-drop.</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" style={{ border: '1px solid #e2e8f0', background: '#fff' }} onClick={handleExportCSV}>⬇ Export CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>📥 Import CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setShowModal(true) }}>+ New Task</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={s.statCard('#2563eb', '#3b82f6')}><div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>Total Tasks</div><div style={{ fontSize: 26, fontWeight: 800 }}>{total}</div></div>
        <div style={s.statCard('#f59e0b', '#fbbf24')}><div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>Overdue</div><div style={{ fontSize: 26, fontWeight: 800 }}>{overdue}</div></div>
        <div style={s.statCard('#059669', '#10b981')}><div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>Completed</div><div style={{ fontSize: 26, fontWeight: 800 }}>{completed}</div></div>
        <div style={s.statCard('#7c3aed', '#8b5cf6')}><div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>In Progress</div><div style={{ fontSize: 26, fontWeight: 800 }}>{grouped['In Progress']?.length || 0}</div></div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>⏳ Loading tasks...</div>
      ) : (
        <div style={s.kanban}>
          {STATUSES.map(status => (
            <div key={status} style={s.column(STATUS_COLORS[status])}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, status)}
            >
              <div style={s.colHeader(STATUS_COLORS[status])}>
                <span style={s.colTitle}>{status}</span>
                <span style={s.colCount(STATUS_COLORS[status])}>{grouped[status]?.length || 0}</span>
              </div>
              <div style={s.colBody}>
                {(grouped[status] || []).map(task => (
                  <div key={task.id} style={s.card(false)} draggable
                    onDragStart={e => handleDragStart(e, task)}
                    onClick={() => { setEditingTask(task); setShowModal(true) }}
                  >
                    <div style={s.cardTitle}>{task.title}</div>
                    <div style={s.cardMeta}>
                      <span style={s.badge(`${PRIORITY_COLORS[task.priority]}20`, PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                      {task.assigned_user && <span>👤 {task.assigned_user.name?.split(' ')[0]}</span>}
                      {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    </div>
                    {task.is_overdue && <div style={s.overdue}>⚠ Overdue</div>}
                    {task.category && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>🏷 {task.category}</div>}
                  </div>
                ))}
                {(grouped[status] || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#cbd5e1', fontSize: 12 }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          employees={employees}
          isAdmin={isAdmin}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Import Modal */}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImportCSV} />}
    </div>
  )
}

// ── Task Create/Edit Modal ──
function TaskModal({ task, employees, isAdmin, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigned_to: task?.assigned_to || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending',
    due_date: task?.due_date || '',
    category: task?.category || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div style={s.modalTitle}>{task ? '✏️ Edit Task' : '📋 New Task'}</div>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.modalBody} className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Title <span className="req">*</span></label>
              <input type="text" className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.emp_code})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {task && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input type="text" className="form-input" placeholder="e.g. Admin, Follow-up" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div style={s.modalFooter}>
            {task && isAdmin && <button type="button" className="btn btn-ghost" style={{ color: '#ef4444', marginRight: 'auto' }} onClick={() => { onDelete(task.id); onClose() }}>🗑 Delete</button>}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── CSV Import Modal ──
function ImportModal({ onClose, onImport }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    await onImport(file)
    setUploading(false)
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div style={s.modalTitle}>📥 Import Tasks from CSV</div>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={s.modalBody}>
          <div style={s.dropZone} onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1' }}
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); e.currentTarget.style.borderColor = '#cbd5e1' }}
          >
            <input type="file" ref={inputRef} accept=".csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div><span style={{ fontSize: 28 }}>📄</span><div style={{ fontWeight: 700, marginTop: 8 }}>{file.name}</div></div>
            ) : (
              <div><span style={{ fontSize: 28 }}>📂</span><div style={{ fontWeight: 600, marginTop: 8 }}>Drop CSV here or click to browse</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Columns: Title, Description, Assigned To (emp_code), Priority, Due Date, Category</div>
              </div>
            )}
          </div>
        </div>
        <div style={s.modalFooter}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!file || uploading} onClick={handleSubmit}>{uploading ? 'Importing...' : 'Import Tasks'}</button>
        </div>
      </div>
    </div>
  )
}
