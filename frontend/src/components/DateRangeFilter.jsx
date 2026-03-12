/**
 * components/DateRangeFilter.jsx
 *
 * date range filter component for lead list page
 * supports preset ranges (today, 7d, 30d, quarterly) + custom date range
 * per PRD requirement: filter by days, months, quarterly + custom date search
 */
import { useState } from 'react'

const PRESETS = [
  { label: 'Today',       key: 'today' },
  { label: '7 Days',      key: '7d' },
  { label: '30 Days',     key: '30d' },
  { label: 'This Quarter',key: 'quarter' },
  { label: 'Custom',      key: 'custom' },
]

function getPresetDates(key) {
  const today = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]

  switch (key) {
    case 'today':
      return { from: fmt(today), to: fmt(today) }
    case '7d': {
      const d = new Date(today); d.setDate(d.getDate() - 7)
      return { from: fmt(d), to: fmt(today) }
    }
    case '30d': {
      const d = new Date(today); d.setDate(d.getDate() - 30)
      return { from: fmt(d), to: fmt(today) }
    }
    case 'quarter': {
      const qStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
      return { from: fmt(qStart), to: fmt(today) }
    }
    default:
      return { from: '', to: '' }
  }
}

export default function DateRangeFilter({ onApply }) {
  const [activePreset, setActivePreset] = useState('')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  function handlePreset(key) {
    setActivePreset(key)
    if (key === 'custom') return
    if (key === activePreset) {
      // toggle off
      setActivePreset('')
      onApply?.({ from: '', to: '' })
      return
    }
    const dates = getPresetDates(key)
    onApply?.(dates)
  }

  function handleCustomApply() {
    if (customFrom && customTo) {
      onApply?.({ from: customFrom, to: customTo })
    }
  }

  function handleClear() {
    setActivePreset('')
    setCustomFrom('')
    setCustomTo('')
    onApply?.({ from: '', to: '' })
  }

  return (
    <div className="date-range-filter" id="date-range-filter">
      <div className="date-range-presets">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={`btn btn-xs ${activePreset === p.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handlePreset(p.key)}
            style={{ minHeight: 36 }}
          >
            {p.label}
          </button>
        ))}
        {activePreset && (
          <button className="btn btn-xs btn-ghost" onClick={handleClear} title="Clear filter">
            ✕
          </button>
        )}
      </div>

      {activePreset === 'custom' && (
        <div className="date-range-custom">
          <input
            type="date"
            className="form-input"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            style={{ minHeight: 44 }}
          />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>to</span>
          <input
            type="date"
            className="form-input"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            style={{ minHeight: 44 }}
          />
          <button
            className="btn btn-primary btn-xs"
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo}
            style={{ minHeight: 36 }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
