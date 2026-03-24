/**
 * components/RevenueGrowthChart.jsx
 *
 * Month-over-month disbursement and commission line/area chart using Recharts.
 * Displays revenue trends from the /api/reports/disbursement endpoint.
 *
 * Props:
 *   data   — array of { month, disbursed, commission } — optional, falls back to empty state
 *   isLoading — if true, renders a skeleton
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const formatINR = (val) => {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`
  if (val >= 100_000)    return `₹${(val / 100_000).toFixed(1)}L`
  if (val >= 1_000)      return `₹${(val / 1_000).toFixed(0)}K`
  return `₹${val}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card, #1a1e2e)', border: '1px solid var(--border, #333)',
      borderRadius: 8, padding: '8px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{formatINR(p.value)}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Fallback demo data when no real data is available ─────────────────────────
const DEMO_DATA = [
  { month: 'Oct', disbursed: 4200000, commission: 84000 },
  { month: 'Nov', disbursed: 5100000, commission: 102000 },
  { month: 'Dec', disbursed: 3800000, commission: 76000 },
  { month: 'Jan', disbursed: 6200000, commission: 124000 },
  { month: 'Feb', disbursed: 7400000, commission: 148000 },
  { month: 'Mar', disbursed: 8100000, commission: 162000 },
]

export default function RevenueGrowthChart({ data, isLoading = false }) {
  const chartData = (data && data.length) ? data : DEMO_DATA
  const isDemo = !data || !data.length

  if (isLoading) {
    return (
      <div style={{ height: 260, background: 'var(--bg2)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
    )
  }

  return (
    <div>
      {isDemo && (
        <div style={{
          fontSize: 11, color: 'var(--text3)', textAlign: 'center',
          marginBottom: 8, fontStyle: 'italic',
        }}>
          Showing demo data — real figures will appear as disbursements are logged.
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradDisb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #2a2e3e)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatINR} tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }}
            iconType="circle" iconSize={8}
          />
          <Area
            type="monotone" dataKey="disbursed" name="Disbursement"
            stroke="#6366f1" strokeWidth={2}
            fill="url(#gradDisb)" dot={false} activeDot={{ r: 5 }}
          />
          <Area
            type="monotone" dataKey="commission" name="Commission"
            stroke="#10b981" strokeWidth={2}
            fill="url(#gradComm)" dot={false} activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
