/**
 * components/PayrollHistoryList.jsx
 *
 * Displays recent payroll ledger entries from the /api/payroll/summary endpoint.
 * Shows a bar chart of payout volume plus a sortable table of entries.
 *
 * Props:
 *   entries   — array of PayrollLedgerEntry (from recent_ledger in summary)
 *   isLoading — boolean
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STATUS_COLOR  = { paid: '#10b981', approved: '#6366f1', pending: '#f59e0b' }
const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i}>
          <div style={{ height: 10, background: 'var(--bg2)', borderRadius: 4, animation: 'pulse 1.5s ease infinite' }} />
        </td>
      ))}
    </tr>
  )
}

export default function PayrollHistoryList({ entries = [], isLoading = false }) {
  // Build sparkline data from the same entries
  const chartData = entries
    .slice()
    .reverse()
    .map((e, i) => ({
      ref:    e.reference_number?.split('-').slice(-1)[0] ?? `#${i + 1}`,
      amount: Number(e.amount ?? 0),
    }))

  return (
    <div>
      {/* Payout volume sparkline */}
      {!isLoading && chartData.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="ref" hide />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [`${formatINR(v)}`, 'Amount']}
                contentStyle={{
                  background: 'var(--card, #1a1e2e)',
                  border: '1px solid var(--border)',
                  borderRadius: 6, fontSize: 11,
                }}
              />
              <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={20}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'right' }}>
            Payout history — latest entry highlighted
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Employee</th>
              <th>Amount</th>
              <th>Processed By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!isLoading && entries.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>
                  No payroll entries yet. Use <strong>POST /api/payroll/process</strong> to mark commissions as paid.
                </td>
              </tr>
            )}

            {!isLoading && entries.map((e) => (
              <tr key={e.id}>
                <td>
                  <code style={{ fontSize: 11, color: 'var(--accent)' }}>{e.reference_number}</code>
                </td>
                <td style={{ fontWeight: 600 }}>{e.user?.name ?? `User #${e.user_id}`}</td>
                <td style={{ color: '#10b981', fontWeight: 700 }}>{formatINR(e.amount)}</td>
                <td style={{ color: 'var(--text2)' }}>{e.processor?.name ?? '—'}</td>
                <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                  {e.created_at
                    ? new Date(e.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
