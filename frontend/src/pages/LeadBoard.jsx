import React, { useState, useMemo } from 'react'
import { useLeads } from '../context/LeadsContext'
import { useAuth } from '../context/AuthContext'
import { STAGES, LOAN_TYPES, PRIORITIES } from '../components/LeadsList'
import DateRangeFilter from '../components/DateRangeFilter'

export default function LeadBoard() {
  const { user } = useAuth()
  const { leads, isLoading, updateStage, deleteLead } = useLeads()
  
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    loanType: '',
    priority: '',
    source: '',
  })
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedLeads, setSelectedLeads] = useState(new Set())

  // --- Filtering Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = filters.search.toLowerCase()
      if (q && !`${l.name} ${l.phone} ${l.email}`.toLowerCase().includes(q)) return false
      if (filters.stage && l.stage !== filters.stage) return false
      if (filters.loanType && l.type !== filters.loanType) return false
      if (filters.priority && l.priority !== filters.priority) return false
      if (filters.source && l.source !== filters.source) return false
      
      // Date filtering
      if (dateRange.from && new Date(l.created_at) < new Date(dateRange.from)) return false
      if (dateRange.to && new Date(l.created_at) > new Date(dateRange.to)) return false
      
      return true
    }).sort((a, b) => {
      const factor = sortDir === 'asc' ? 1 : -1
      if (a[sortBy] < b[sortBy]) return -1 * factor
      if (a[sortBy] > b[sortBy]) return 1 * factor
      return 0
    })
  }, [leads, filters, dateRange, sortBy, sortDir])

  // --- Handlers ---
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const toggleSelect = (id) => {
    const next = new Set(selectedLeads)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedLeads(next)
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) setSelectedLeads(new Set())
    else setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
  }

  const handleBulkStageChange = (newStage) => {
    if (!newStage) return
    selectedLeads.forEach(id => updateStage(id, newStage))
    setSelectedLeads(new Set())
  }

  const handleExport = () => {
    // Basic CSV export
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Amount', 'Stage', 'Priority', 'Created At']
    const rows = filteredLeads.map(l => [l.id, l.name, l.phone, l.email, l.amount, l.stage, l.priority, l.created_at])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `lead_board_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div id="page-leadboard" className="page active">
      <div className="card-header">
        <div>
          <h2 className="card-title">📋 Lead Board</h2>
          <p className="card-sub">Centralized lead tracking with advanced management tools.</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>Export Results</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <div className="search-wrap" style={{ flex: 2 }}>
            <input 
              className="form-input" 
              placeholder="Search by name, phone, or email..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <select className="form-select" value={filters.stage} onChange={(e) => setFilters({...filters, stage: e.target.value})}>
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" value={filters.loanType} onChange={(e) => setFilters({...filters, loanType: e.target.value})}>
            <option value="">All Loan Types</option>
            {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-select" value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <DateRangeFilter onApply={setDateRange} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
             <button className="btn btn-ghost btn-xs" onClick={() => setFilters({ search: '', stage: '', loanType: '', priority: '', source: '' })}>Clear All</button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <div className="card" style={{ marginBottom: 16, backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            {selectedLeads.size} leads selected
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Move to:</span>
            <select 
              className="form-select" 
              style={{ width: 140, padding: '4px 8px', fontSize: 12 }}
              onChange={(e) => handleBulkStageChange(e.target.value)}
              value=""
            >
              <option value="">Select Stage...</option>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-danger btn-sm" onClick={() => { if(window.confirm('Archive selected leads?')) { /* Bulk delete logic */ }}}>Archive</button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0} onChange={toggleSelectAll} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>Lead {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Contact</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('type')}>Type {sortBy === 'type' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('amount')}>Amount {sortBy === 'amount' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('stage')}>Stage {sortBy === 'stage' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('priority')}>Priority {sortBy === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('created_at')}>Created {sortBy === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => (
                <tr key={l.id} className={selectedLeads.has(l.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" checked={selectedLeads.has(l.id)} onChange={() => toggleSelect(l.id)} />
                  </td>
                  <td>
                    <div className="td-name">
                       {l.name}
                       {l.is_new && <span className="badge badge-new" style={{ fontSize: 9, marginLeft: 6 }}>NEW</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>{l.phone}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.email}</div>
                  </td>
                  <td>{l.type}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>{l.amount}</td>
                  <td>
                    <select 
                      className="form-select" 
                      style={{ padding: '4px 8px', fontSize: 11, width: 120 }}
                      value={l.stage}
                      onChange={(e) => updateStage(l.id, e.target.value)}
                    >
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${l.priority === 'High' ? 'badge-high' : l.priority === 'Medium' ? 'badge-med' : 'badge-low'}`}>
                      {l.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && !isLoading && (
                <tr><td colSpan="8" className="empty">No leads found matching current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .selected-row { background-color: var(--accent-light) !important; }
      `}</style>
    </div>
  )
}
