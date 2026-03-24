/**
 * components/AnalyticsFunnelChart.jsx
 *
 * Lead conversion funnel chart using Recharts.
 * Displays pipeline stages as a descending funnel with percentage labels.
 *
 * Props:
 *   data  — array of { stage, count } from /api/reports/leads by_stage
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STAGE_ORDER = ['New', 'Contacted', 'Application', 'Documents', 'Processing', 'Sanctioned', 'Disbursement']
const STAGE_COLOR = {
  New:          '#6366f1',
  Contacted:    '#8b5cf6',
  Application:  '#a78bfa',
  Documents:    '#06b6d4',
  Processing:   '#0ea5e9',
  Sanctioned:   '#10b981',
  Disbursement: '#f59e0b',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--card, #1a1e2e)', border: '1px solid var(--border, #333)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{d.stage}</div>
      <div>Count: <strong>{d.count}</strong></div>
      <div>Share: <strong>{d.pct}%</strong></div>
    </div>
  )
}

export default function AnalyticsFunnelChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
        No pipeline data for selected period.
      </div>
    )
  }

  // Sort by stage order and add percentage
  const total = data.reduce((s, d) => s + Number(d.count), 0)
  const sorted = STAGE_ORDER
    .map(stage => data.find(d => d.stage === stage))
    .filter(Boolean)
    .map(d => ({ ...d, count: Number(d.count), pct: total ? Math.round((d.count / total) * 100) : 0 }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #333)" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="stage" width={100}
            tick={{ fill: 'var(--text2, #aaa)', fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28} label={{
            position: 'right', fontSize: 11, fill: 'var(--text2)',
            formatter: (v) => `${v}  (${sorted.find(s => s.count === v)?.pct ?? 0}%)`,
          }}>
            {sorted.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_COLOR[entry.stage] ?? '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 12, justifyContent: 'center' }}>
        {sorted.map(d => (
          <div key={d.stage} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: STAGE_COLOR[d.stage] ?? '#6366f1' }} />
            {d.stage}
          </div>
        ))}
      </div>
    </div>
  )
}
