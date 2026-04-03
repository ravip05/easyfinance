/**
 * pages/Dashboard.jsx
 *
 * Full React port of renderDashboard() + all builder functions from LoanCRM_v9.html.
 *
 * Architecture:
 *   Dashboard          — top-level component, reads LeadsContext, routes to role view
 *   ├── RoleBanner     — gradient welcome banner (roleBanner())
 *   ├── StatCard       — single KPI card (statCard())
 *   ├── TrendChart     — bar chart, last 6 months (buildTrendChart())
 *   ├── DonutChart     — SVG stage breakdown (buildDonut())
 *   ├── RecentLeads    — last 6 leads list (buildRecentLeads())
 *   ├── Leaderboard    — sorted employee ranking (buildLeaderboard())
 *   └── FollowUps      — horizontal scroll of follow-up cards (buildFollowups())
 *
 * Each role gets its own section:
 *   admin   → 8 stat cards, trend + donut, recent leads + leaderboard, follow-ups
 *   manager → 4 stat cards, trend + donut, team leads + leaderboard, follow-ups
 *   staff   → 4 stat cards, my leads + donut, follow-ups
 *   dsa     → 4 stat cards, franchise info panel, leads + donut, follow-ups
 *
 * Data source: LeadsContext (same array as the table + pipeline — zero extra fetch)
 * Employees / franchises: fetched once on mount from /api/staff + /api/franchises
 */

import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'
import { useLeads } from '../context/LeadsContext'
import apiClient    from '../api/client'

// ── Helpers (JS ports of prototype helpers) ───────────────────────────────────
function parseAmt(s) {
  if (!s) return 0
  s = String(s).replace(/[₹,\s]/g, '')
  if (s.endsWith('Cr')) return parseFloat(s) * 10_000_000
  if (s.endsWith('L'))  return parseFloat(s) * 100_000
  if (s.endsWith('K'))  return parseFloat(s) * 1_000
  return parseFloat(s) || 0
}

function fmtCr(n) {
  if (n >= 10_000_000) return '₹' + (n / 10_000_000).toFixed(1) + 'Cr'
  if (n >= 100_000)   return '₹' + (n / 100_000).toFixed(1) + 'L'
  if (n >= 1_000)     return '₹' + (n / 1_000).toFixed(0) + 'K'
  return '₹' + n
}

const STAGE_BADGE = {
  New:'badge-new', Contacted:'badge-contacted', 'Docs Pending':'badge-docs',
  'Docs Received':'badge-docs', CIBIL:'badge-cibil', Login:'badge-login',
  Processing:'badge-processing', Sanctioned:'badge-sanction',
  Disbursed:'badge-disbursed', Closed:'badge-closed',
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** RoleBanner — gradient welcome header with name, role icon, scope label */
function RoleBanner({ user, scopeLabel }) {
  const grad = {
    admin:   'linear-gradient(135deg,#1e3a5f,#2563eb)',
    manager: 'linear-gradient(135deg,#065f46,#059669)',
    staff:   'linear-gradient(135deg,#4c1d95,#7c3aed)',
    dsa:     'linear-gradient(135deg,#92400e,#d97706)',
  }
  const icon  = { admin:'🛡️', manager:'👔', staff:'👤', dsa:'🤝' }
  const descs = {
    admin:   'You have full system access. Viewing all branches and team data.',
    manager: `Viewing data for your team.`,
    staff:   'You are viewing your assigned leads and clients.',
    dsa:     `Viewing business data for your franchise.`,
  }
  const role = user.role ?? 'staff'

  return (
    <div style={{
      background: grad[role] ?? grad.admin,
      borderRadius: 14, padding: '14px 18px',
      color: '#fff', display: 'flex', alignItems: 'center',
      gap: 14, marginBottom: 18, flexWrap: 'wrap',
    }}>
      {/* Avatar circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        border: '2px solid rgba(255,255,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {user.initials ?? user.name?.slice(0, 2).toUpperCase()}
      </div>
      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 800 }}>
          Welcome back, {user.name?.split(' ')[0]}! {icon[role]}
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
          {descs[role]}
        </div>
      </div>
      {/* Scope badge */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 8, padding: '6px 14px', textAlign: 'center', flexShrink: 0,
      }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800 }}>
          {scopeLabel}
        </div>
        <div style={{ fontSize: 10, opacity: 0.8 }}>Data Scope</div>
      </div>
    </div>
  )
}

/** StatCard — KPI tile (with optional glassmorphism variant) */
function StatCard({ icon, label, value, sub, subUp, iconClass = 'blue', glass = '' }) {
  return (
    <div className={`stat-card${glass ? ` ${glass}` : ''}`}>
      <div className="stat-card-top">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {sub && (
            <div className={`stat-sub${subUp ? ' up' : ''}`}>{sub}</div>
          )}
        </div>
        <div className={`stat-icon-wrap ${iconClass}`}>{icon}</div>
      </div>
    </div>
  )
}

/** ActivityFeed — real-time action log (replaces the demo's activity feed) */
function ActivityFeed({ leads }) {
  // Generate activity entries from leads data
  const activities = useMemo(() => {
    const items = []
    const sorted = [...leads].sort((a, b) => {
      const da = a.updated_at || a.created_at || ''
      const db = b.updated_at || b.created_at || ''
      return db.localeCompare(da)
    })

    sorted.slice(0, 8).forEach((lead) => {
      const name = lead.name || 'Unknown'
      const assigned = lead.assigned || 'Unassigned'
      const stage = lead.stage || 'New'

      if (stage === 'Disbursed') {
        items.push({ text: `<strong>${name}</strong> — Loan disbursed successfully`, dot: 'green', time: lead.updated_at || lead.created_at })
      } else if (stage === 'Sanctioned') {
        items.push({ text: `<strong>${name}</strong> — Loan sanctioned by bank`, dot: 'purple', time: lead.updated_at || lead.created_at })
      } else if (stage === 'Processing') {
        items.push({ text: `<strong>${name}</strong> — Under processing (${assigned})`, dot: 'gold', time: lead.updated_at || lead.created_at })
      } else if (stage === 'New') {
        items.push({ text: `<strong>${name}</strong> — New lead added`, dot: 'blue', time: lead.created_at })
      } else if (lead.isOverdue) {
        items.push({ text: `<strong>${name}</strong> — Follow-up overdue!`, dot: 'red', time: lead.followup })
      } else {
        items.push({ text: `<strong>${name}</strong> — Moved to ${stage}`, dot: 'blue', time: lead.updated_at || lead.created_at })
      }
    })
    return items
  }, [leads])

  if (!activities.length) {
    return <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No recent activity</div>
  }

  return (
    <div className="activity-feed">
      {activities.map((item, i) => (
        <div className="activity-item" key={i}>
          <div className={`activity-dot ${item.dot}`} />
          <div className="activity-body">
            <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
            <div className="activity-time">{item.time ? new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** TrendChart — bar chart of lead activity across 6 months (buildTrendChart() port) */
function TrendChart({ leads, label }) {
  const total  = leads.length
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
  const vals   = total === 0
    ? [0, 0, 0, 0, 0, 0]
    : [
        Math.floor(total * 0.44), Math.floor(total * 0.53),
        Math.floor(total * 0.61), Math.floor(total * 0.56),
        Math.floor(total * 0.72), total,
      ]
  const max = Math.max(...vals, 1)

  return (
    <div>
      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%' }}>
            <div style={{
              fontSize: 10, fontWeight: i === 5 ? 700 : 400,
              color: i === 5 ? 'var(--accent)' : 'var(--text3)',
            }}>
              {v}
            </div>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: max > 0 ? `${(v / max) * 75}px` : '4px',
                minHeight: 4,
                borderRadius: '4px 4px 0 0',
                background: i === 5 ? 'var(--accent)' : 'var(--bg2)',
                border: i === 5 ? 'none' : '1px solid var(--border)',
                transition: 'height 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
      {/* Month labels */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {months.map((m, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', fontSize: 10,
            color: i === 5 ? 'var(--accent)' : 'var(--text3)',
            fontWeight: i === 5 ? 700 : 400,
          }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  )
}

/** DonutChart — SVG stage breakdown (buildDonut() port) */
function DonutChart({ leads }) {
  const STAGE_COLORS = {
    New: '#2563eb', Processing: '#059669', 'Docs Pending': '#d97706',
    Sanctioned: '#7c3aed', Disbursed: '#0891b2', CIBIL: '#ea580c',
    Login: '#10b981', Contacted: '#94a3b8', Closed: '#cbd5e1',
  }
  const circumference = 2 * Math.PI * 48   // r = 48
  const total = leads.length || 1

  // Count per stage
  const counts = {}
  leads.forEach((l) => { counts[l.stage] = (counts[l.stage] || 0) + 1 })

  // Build arcs
  let offset = 0
  const arcs = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([stage, cnt]) => {
      const dash  = (cnt / total) * circumference
      const color = STAGE_COLORS[stage] ?? '#94a3b8'
      const arc   = { stage, cnt, dash, offset, color }
      offset += dash
      return arc
    })

  if (!leads.length) {
    return (
      <div className="empty">
        <div className="empty-icon">📊</div>
        <div className="empty-text">No leads to chart</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      {/* SVG donut */}
      <div className="donut-chart" style={{ flexShrink: 0 }}>
        <svg width="110" height="110" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="16" />
          {/* Segments */}
          {arcs.map((a) => (
            <circle
              key={a.stage}
              cx="60" cy="60" r="48"
              fill="none"
              stroke={a.color}
              strokeWidth="16"
              strokeDasharray={`${a.dash.toFixed(1)} ${circumference.toFixed(1)}`}
              strokeDashoffset={(-a.offset).toFixed(1)}
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="donut-center">
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800 }}>
            {leads.length}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>Leads</span>
        </div>
      </div>
      {/* Legend */}
      <div style={{ flex: 1, minWidth: 120 }}>
        {arcs.map((a) => (
          <div className="bank-row" key={a.stage} style={{ fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 9, height: 9, borderRadius: 2,
                background: a.color, display: 'inline-block', flexShrink: 0,
              }} />
              {a.stage}
            </span>
            <strong>{a.cnt}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

/** RecentLeads — last 6 leads mini-list (buildRecentLeads() port) */
function RecentLeads({ leads, onViewAll }) {
  if (!leads.length) {
    return (
      <div className="empty">
        <div className="empty-icon">🎯</div>
        <div className="empty-text">No leads in your scope</div>
      </div>
    )
  }

  return (
    <>
      {leads.slice(0, 6).map((l) => (
        <div
          key={l.id}
          className="dash-lead-item"
          onClick={onViewAll}
          style={{ cursor: 'pointer' }}
        >
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: l.color ?? 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {l.initials}
          </div>
          {/* Name + meta */}
          <div className="dash-lead-body">
            <div className="dash-lead-name">{l.name}</div>
            <div className="dash-lead-meta">{l.type} · {l.assigned}</div>
          </div>
          {/* Amount + stage */}
          <div className="dash-lead-right">
            <div className="dash-lead-amount">{l.amount}</div>
            <span
              className={`badge ${STAGE_BADGE[l.stage] ?? 'badge-new'}`}
              style={{ fontSize: 10, marginTop: 2, display: 'inline-block' }}
            >
              {l.stage}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}

/** Leaderboard — employee ranking bars (buildLeaderboard() port) */
function Leaderboard({ employees }) {
  if (!employees?.length) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>
        Leaderboard not available for your role
      </div>
    )
  }

  const medals    = ['🥇', '🥈', '🥉', '4.', '5.', '6.']
  const barColors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#ea580c']
  const sorted    = [...employees].sort((a, b) => (b.conv ?? 0) - (a.conv ?? 0))
  const maxConv   = sorted[0]?.conv || 1

  return (
    <>
      {sorted.map((e, i) => (
        <div className="dash-leader-item" key={e.name ?? i}>
          <div className="dash-leader-rank">{medals[i] ?? `${i + 1}.`}</div>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: e.bg ?? barColors[i % barColors.length],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {e.initials ?? e.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="dash-leader-bar-wrap">
            <div className="dash-leader-name">{e.name}</div>
            <div className="dash-leader-bar">
              <div
                className="dash-leader-fill"
                style={{
                  width: `${Math.round((e.conv ?? 0) / maxConv * 100)}%`,
                  background: barColors[i % barColors.length],
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
              {e.leads} leads · {e.leads ? Math.round((e.conv ?? 0) / e.leads * 100) : 0}% conv
            </div>
          </div>
          <div className="dash-leader-val">{e.conv ?? 0}</div>
        </div>
      ))}
    </>
  )
}

/** FollowUps — horizontal scroll of overdue/today/upcoming cards (buildFollowups() port) */
function FollowUps({ leads }) {
  const fuLeads = leads.filter((l) => l.followup).slice(0, 8)
  const today   = new Date().toISOString().split('T')[0]

  if (!fuLeads.length) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        No follow-ups scheduled
      </div>
    )
  }

  return (
    <div className="followup-scroll">
      {fuLeads.map((l) => {
        const isOverdue = l.followup < today
        const isToday   = l.followup === today
        const cls       = isOverdue ? 'overdue' : isToday ? 'today' : 'upcoming'

        return (
          <div className={`fu-card ${cls}`} key={l.id}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{l.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
              {l.type} · {l.amount}
            </div>
            {isOverdue && (
              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5, fontWeight: 600 }}>
                ⚠ Overdue
              </div>
            )}
            {isToday && !isOverdue && (
              <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 5, fontWeight: 600 }}>
                📋 Due Today
              </div>
            )}
            {!isOverdue && !isToday && (
              <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 5, fontWeight: 600 }}>
                🔵 {l.followup}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Role-specific dashboard layouts ──────────────────────────────────────────

function AdminDashboard({ leads, clients, employees, onViewLeads }) {
  const totalLeads  = leads.length
  const disbursed   = leads.filter((l) => l.stage === 'Disbursed').reduce((s, l) => s + parseAmt(l.amount), 0)
  const activeFiles = leads.filter((l) => !['Disbursed', 'Closed'].includes(l.stage)).length
  const convRate    = totalLeads
    ? Math.round(leads.filter((l) => ['Sanctioned', 'Disbursed'].includes(l.stage)).length / totalLeads * 100)
    : 0
  const docsPending = leads.filter((l) => l.stage === 'Docs Pending').length
  const followupPending = leads.filter((l) => l.followup).length

  return (
    <>
      {/* Row 1 — 4 primary KPIs (Premium Glassmorphism) */}
      <div className="stats-grid">
        <StatCard icon="🎯" label="Total Leads"       value={totalLeads}          sub="↑ 18 this week"           subUp  iconClass="blue"   glass="glass-blue"  />
        <StatCard icon="💰" label="Disbursed (Month)" value={fmtCr(disbursed)}    sub="↑ 12% vs last month"      subUp  iconClass="green"  glass="glass-green" />
        <StatCard icon="📁" label="Active Files"       value={activeFiles}         sub={`${docsPending} pending docs`}   iconClass="gold"   glass="glass-gold"  />
        <StatCard icon="📊" label="Conversion Rate"    value={`${convRate}%`}      sub="↑ 5% this quarter"        subUp  iconClass="purple" glass="glass-purple"/>
      </div>

      {/* Row 2 — 4 secondary KPIs */}
      <div className="stats-grid" style={{ marginTop: 12 }}>
        <StatCard icon="👥" label="Total Staff"      value={employees.length}  sub="Across all depts"  iconClass="blue"   />
        <StatCard icon="🏢" label="Franchises"       value="—"                 sub="Active partners"   iconClass="green"  />
        <StatCard icon="👤" label="Total Clients"    value={clients.length}    sub="Active clients"    iconClass="gold"   />
        <StatCard icon="🏦" label="Banks Onboarded"  value={6}                 sub="Active tie-ups"    iconClass="purple" />
      </div>

      {/* Activity Feed — real-time action log */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">⚡ Recent Activity</div>
          <span className="badge badge-active">Live</span>
        </div>
        <ActivityFeed leads={leads} />
      </div>

      {/* Charts row */}
      <div className="grid-2 section-gap" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Lead Trend</div>
              <div className="card-sub">All branches · Last 6 months</div>
            </div>
            <span className="badge badge-active">Live</span>
          </div>
          <TrendChart leads={leads} label="All" />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Lead Status Breakdown</div>
          </div>
          <DonutChart leads={leads} />
        </div>
      </div>

      {/* Tables row */}
      <div className="grid-2 section-gap" style={{ marginTop: 16 }} id="dash-tables-row">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Recent Leads (All)</div>
            <button className="btn btn-ghost btn-sm" onClick={onViewLeads}>View All →</button>
          </div>
          <RecentLeads leads={leads} onViewAll={onViewLeads} />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Employee Leaderboard</div>
            <span className="badge badge-active" style={{ fontSize: 10 }}>This Month</span>
          </div>
          <Leaderboard employees={employees} />
        </div>
      </div>

      {/* Follow-ups */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">⏰ Follow-ups (All Teams)</div>
          <span className="badge badge-high">{followupPending} pending</span>
        </div>
        <FollowUps leads={leads} />
      </div>
    </>
  )
}

function ManagerDashboard({ user, leads, clients, employees, onViewLeads }) {
  const totalLeads  = leads.length
  const converted   = leads.filter((l) => ['Sanctioned', 'Disbursed'].includes(l.stage)).length
  const disbursed   = leads.filter((l) => l.stage === 'Disbursed').reduce((s, l) => s + parseAmt(l.amount), 0)
  const convRate    = totalLeads ? Math.round(converted / totalLeads * 100) : 0
  const followupPending = leads.filter((l) => l.followup).length

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="🎯" label="Team Leads"      value={totalLeads}       sub="↑ this week"       subUp  iconClass="blue"   />
        <StatCard icon="💰" label="Team Disbursed"  value={fmtCr(disbursed)} sub="This month"        subUp  iconClass="green"  />
        <StatCard icon="👥" label="Team Size"       value={employees.length} sub="Active members"           iconClass="gold"   />
        <StatCard icon="📈" label="Conv. Rate"      value={`${convRate}%`}   sub="↑ vs last month"   subUp={convRate > 25} iconClass="purple" />
      </div>

      <div className="grid-2 section-gap" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📈 Team Lead Trend</div>
              <div className="card-sub">Last 6 months</div>
            </div>
            <span className="badge badge-active">Live</span>
          </div>
          <TrendChart leads={leads} label="Team" />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Stage Breakdown</div></div>
          <DonutChart leads={leads} />
        </div>
      </div>

      <div className="grid-2 section-gap" style={{ marginTop: 16 }} id="dash-tables-row">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Team Recent Leads</div>
            <button className="btn btn-ghost btn-sm" onClick={onViewLeads}>View All →</button>
          </div>
          <RecentLeads leads={leads} onViewAll={onViewLeads} />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 My Team Leaderboard</div>
            <span className="badge badge-active" style={{ fontSize: 10 }}>This Month</span>
          </div>
          <Leaderboard employees={employees} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">⏰ Team Follow-ups</div>
          <span className="badge badge-high">{followupPending} pending</span>
        </div>
        <FollowUps leads={leads} />
      </div>
    </>
  )
}

function StaffDashboard({ user, leads, clients, onViewLeads }) {
  const myLeads   = leads.length
  const active    = leads.filter((l) => !['Disbursed', 'Closed'].includes(l.stage)).length
  const disbursed = leads.filter((l) => l.stage === 'Disbursed').reduce((s, l) => s + parseAmt(l.amount), 0)
  const highPrio  = leads.filter((l) => l.priority === 'High').length
  const followupPending = leads.filter((l) => l.followup).length

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="🎯" label="My Leads"     value={myLeads}          sub="Assigned to me"                iconClass="blue"   />
        <StatCard icon="🔄" label="Active Files" value={active}           sub="In progress"                   iconClass="gold"   />
        <StatCard icon="💰" label="My Disbursed" value={fmtCr(disbursed)} sub="This month" subUp={disbursed>0} iconClass="green"  />
        <StatCard icon="🔥" label="High Priority"value={highPrio}         sub="Need attention"                iconClass="purple" />
      </div>

      <div className="grid-2 section-gap" style={{ marginTop: 16 }} id="dash-tables-row">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 My Leads</div>
            <button className="btn btn-ghost btn-sm" onClick={onViewLeads}>View All →</button>
          </div>
          <RecentLeads leads={leads} onViewAll={onViewLeads} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">📊 My Lead Stages</div></div>
          <DonutChart leads={leads} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">⏰ My Follow-ups</div>
          <span className="badge badge-high">{followupPending} scheduled</span>
        </div>
        <FollowUps leads={leads} />
      </div>
    </>
  )
}

function DSADashboard({ user, leads, clients, onViewLeads }) {
  const totalLeads     = leads.length
  const converted      = leads.filter((l) => ['Sanctioned', 'Disbursed'].includes(l.stage)).length
  const totalDisbursed = leads.filter((l) => l.stage === 'Disbursed').reduce((s, l) => s + parseAmt(l.amount), 0)
  const convRate       = totalLeads ? Math.round(converted / totalLeads * 100) : 0
  const followupPending = leads.filter((l) => l.followup).length

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="📋" label="My Leads"   value={totalLeads}          sub="This month"                  iconClass="blue"   />
        <StatCard icon="✅" label="Converted"  value={converted}           sub={`${convRate}% rate`}  subUp  iconClass="green"  />
        <StatCard icon="💰" label="Disbursed"  value={fmtCr(totalDisbursed)} sub="Sanctioned value"   subUp  iconClass="gold"   />
        <StatCard icon="💼" label="My Clients" value={clients.length}      sub="Active"                      iconClass="purple" />
      </div>

      {/* Franchise info panel (mirrors the fr? conditional in buildDSADash) */}
      {user.franchiseCode && (
        <div style={{
          background: 'linear-gradient(135deg,var(--surface),var(--surface2))',
          border: '1px solid var(--border)', borderRadius: 14,
          padding: '14px 18px', marginTop: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            My Franchise
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Franchise Code</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user.franchiseCode}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Your Name</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 section-gap" style={{ marginTop: 16 }} id="dash-tables-row">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 My Recent Leads</div>
            <button className="btn btn-ghost btn-sm" onClick={onViewLeads}>View All →</button>
          </div>
          <RecentLeads leads={leads} onViewAll={onViewLeads} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Lead Status</div></div>
          <DonutChart leads={leads} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">⏰ Follow-ups</div>
          <span className="badge badge-high">{followupPending} scheduled</span>
        </div>
        <FollowUps leads={leads} />
      </div>
    </>
  )
}

// ── Main Dashboard component ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { leads, isLoading } = useLeads()

  const role = user?.role ?? 'staff'

  // Fetch employees list for admin/manager leaderboard
  const [employees, setEmployees] = useState([])
  useEffect(() => {
    if (!['admin', 'manager'].includes(role)) return
    apiClient.get('/staff')
      .then(({ data }) => setEmployees(data.data ?? []))
      .catch(() => {})  // non-critical — leaderboard shows graceful fallback
  }, [role])

  // Register push notifications on dashboard load
  useEffect(() => {
    async function registerPush() {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        try {
          // In a real app, you'd call registration.pushManager.subscribe() with a VAPID key.
          // For now, we register the device with a mock token to the backend.
          const mockToken = btoa(user?.id + '-' + navigator.userAgent.substring(0, 10));
          await apiClient.post('/push-subscriptions', {
            platform: 'web',
            token: mockToken,
            device_name: navigator.userAgent.substring(0, 50)
          });
          console.log('Push notification registration successful');
        } catch (e) {
          console.error('Push registration error:', e);
        }
      }
    }
    
    if (user?.id) {
      registerPush();
    }
  }, [user]);

  // Scope the clients list (we approximate from leads for now)
  // Real implementation would fetch /api/clients — wired in Step 6
  // "All people in leads are our clients" - User Requirement
  const clients = useMemo(() => {
    return leads
  }, [leads])

  const scopeLabels = { admin: 'All Data', manager: 'My Team', staff: 'My Data', dsa: 'My Franchise' }

  function onViewLeads() { navigate('/leads') }

  if (isLoading) {
    return (
      <div id="page-dashboard" className="page active">
        {user && <RoleBanner user={user} scopeLabel={scopeLabels[role] ?? 'My Data'} />}
        {/* Skeleton stat grid */}
        <div className="stats-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="stat-card">
              <div style={{ height: 60, borderRadius: 8, background: 'var(--bg2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    )
  }

  return (
    <div id="page-dashboard" className="page active">
      {/* Role banner */}
      {user && <RoleBanner user={user} scopeLabel={scopeLabels[role] ?? 'My Data'} />}

      {/* Role-specific content */}
      {role === 'admin' && (
        <AdminDashboard
          leads={leads} clients={clients} employees={employees}
          onViewLeads={onViewLeads}
        />
      )}
      {role === 'manager' && (
        <ManagerDashboard
          user={user} leads={leads} clients={clients} employees={employees}
          onViewLeads={onViewLeads}
        />
      )}
      {role === 'staff' && (
        <StaffDashboard
          user={user} leads={leads} clients={clients}
          onViewLeads={onViewLeads}
        />
      )}
      {role === 'dsa' && (
        <DSADashboard
          user={user} leads={leads} clients={clients}
          onViewLeads={onViewLeads}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
