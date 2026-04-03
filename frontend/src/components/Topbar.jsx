/**
 * components/Topbar.jsx
 *
 * Faithful React conversion of the <div class="topbar"> in LoanCRM_v9.html.
 *
 * Features preserved from the prototype:
 *   ✓ Hamburger menu button (mobile, triggers sidebar open)
 *   ✓ Dynamic page title — derived from the current route
 *   ✓ Search input (wired to onSearch prop for parent pages to consume)
 *   ✓ Online indicator dot (net-dot)
 *   ✓ Role pill badge (rp-admin, rp-manager, rp-staff, rp-dsa)
 *   ✓ Notification bell with red dot
 *   ✓ "+ New Lead" primary button (shown on /leads page)
 *   ✓ Logout button
 *   ✓ All original CSS class names preserved
 *
 * Props:
 *   onHamburger   fn   — called when the ☰ button is pressed
 *   onSearch      fn   — called with the current search string
 *   onNewLead     fn   — called when "+ New Lead" is clicked (Leads page)
 *   notifCount    int  — badge count for the bell (0 = no dot)
 *
 * The component reads the current route to derive the page title
 * automatically, so callers don't have to pass a title prop.
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// ── Page title map ─────────────────────────────────────────────────────────────
// Maps route paths to the human-readable title shown in the topbar.
// This is the React equivalent of the prototype's page title rendering.
const PAGE_TITLES = {
  dashboard:    'Dashboard',
  leads:        'Lead Management',
  clients:      'Client Profiles',
  pipeline:     'Pipeline View',
  employees:    'Employees',
  franchise:    'Franchise',
  bankpolicies: 'Bank Policies',
  lms:          'Training & LMS',
  reports:      'Reports',
  announcements:'Announcements',
  calculator:   'Loan Calculator',
  cibil:        'CIBIL Checker',
  settings:     'Admin Settings',
  hr:           'HR Module',
  duplicates:   'Duplicate Checker',
  idcard:       'ID Cards',
  myattendance: 'My Attendance',
  tasks:        'Task Board',
  'policy-management': 'Policy Admin',
}

// Role label override for staff / DSA dashboard title
const ROLE_DASHBOARD_TITLES = {
  staff: 'My Dashboard',
  dsa:   'My Dashboard',
}

// ── Role pill config ───────────────────────────────────────────────────────────
const ROLE_PILL_CONFIG = {
  admin:   { cls: 'rp-admin',   label: '🛡️ Admin'    },
  manager: { cls: 'rp-manager', label: '👔 Manager'   },
  staff:   { cls: 'rp-staff',   label: '👤 Staff'     },
  dsa:     { cls: 'rp-dsa',     label: '🤝 DSA'       },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Topbar({
  onHamburger,
  onSearch,
  onNewLead,
  notifCount = 0,
}) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [search, setSearch] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const role       = user?.role ?? 'staff'
  const activePage = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard'

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { announcementsApi } = await import('../api/announcements')
      const res = await announcementsApi.list({ per_page: 5 })
      const list = res.data.data || []
      setAnnouncements(list)
      // Simple heuristic: if we had a way to check unread, we'd use it. 
      // For now, we'll just show the latest 5 as unread if they are recent.
      setUnreadCount(list.length > 0 ? list.length : 0)
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    }
  }

  useState(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // update every minute
    return () => clearInterval(interval)
  }, [])

  // Derive the topbar title from the route
  const rawTitle = PAGE_TITLES[activePage] ?? activePage
  const pageTitle =
    activePage === 'dashboard' && ROLE_DASHBOARD_TITLES[role]
      ? ROLE_DASHBOARD_TITLES[role]
      : rawTitle

  // Role pill
  const pillConfig = ROLE_PILL_CONFIG[role] ?? ROLE_PILL_CONFIG.staff

  // Show "+ New Lead" for staff/manager/admin on all pages (matching demo)
  const showNewLead = !['dsa', 'client'].includes(role)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    onSearch?.(val)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') {
      setSearch('')
      onSearch?.('')
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const displayNotifCount = notifCount > 0 ? notifCount : unreadCount

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="topbar" role="banner">

      {/* ── Hamburger (mobile only — CSS hides it on desktop) ── */}
      <button
        className="hamburger"
        onClick={onHamburger}
        aria-label="Open menu"
        id="hamburger-btn"
      >
        ☰
      </button>

      {/* ── Page title ── */}
      <div className="topbar-title" id="page-title">
        {pageTitle}
      </div>

      {/* ── Search bar (hidden on small phones via CSS) ── */}
      <div className="topbar-search">
        <input
          type="text"
          placeholder="Search leads, clients…"
          aria-label="Search"
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* ── Right-side actions ── */}
      <div className="topbar-actions">

        {/* Online status indicator — green dot, always online in SPA context */}
        <span
          className="net-dot"
          id="net-dot"
          title="Online"
          style={{
            display: 'inline-block',
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'var(--green)',
            flexShrink: 0,
          }}
        />

        {/* Role pill badge */}
        <span
          className={`role-pill ${pillConfig.cls}`}
          id="topbar-role-pill"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
          title="My Account"
        >
          {pillConfig.label}
        </span>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn notif-btn"
            id="bell-btn-1"
            title="Notifications"
            onClick={() => { setShowNotif(!showNotif); setShowProfileMenu(false); }}
            aria-label={`Notifications${notifCount > 0 ? ` (${notifCount} unread)` : ''}`}
            style={{ position: 'relative' }}
          >
            🔔
            {notifCount > 0 && (
              <>
                {/* Red dot — always shown when count > 0 */}
                <span
                  id="notif-dot-1"
                  style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 8, height: 8,
                    background: '#ef4444', borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
                {/* Numeric badge — shown when count fits in the badge */}
                {notifCount <= 99 && (
                  <span
                    id="notif-badge-1"
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      background: '#ef4444', color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      borderRadius: '50%', width: 16, height: 16,
                      lineHeight: '16px', textAlign: 'center',
                    }}
                  >
                    {notifCount}
                  </span>
                )}
              </>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotif && (
            <div 
              className="notif-dropdown"
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                width: '320px', background: 'var(--bg)', borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)',
                zIndex: 1000, overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
                <span 
                  style={{ fontSize: '12px', color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => { setShowNotif(false); navigate('/announcements'); }}
                >
                  View All
                </span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {announcements.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
                    No new notifications.
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div 
                      key={ann.id}
                      className="notif-item"
                      onClick={() => { setShowNotif(false); navigate('/announcements'); }}
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{ann.title}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 400 }}>
                          {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ann.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* My Account Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="topbar-profile-btn"
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotif(false); }}
            title="My Account"
            aria-label="My Account"
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '13px', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)', transition: 'transform 0.2s',
              border: '2px solid white'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {user?.initials ?? user?.name?.slice(0, 2).toUpperCase() ?? 'ME'}
          </button>
          
          {showProfileMenu && (
            <div 
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                width: '240px', background: 'var(--bg)', borderRadius: '16px',
                boxShadow: '0 12px 32px -4px rgba(0,0,0,0.15), 0 4px 12px -2px rgba(0,0,0,0.08)', 
                border: '1px solid var(--border)',
                zIndex: 1000, overflow: 'hidden',
                animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                  {user?.email || role.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div 
                  onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '15px' }}>👤</span> My Profile
                </div>
                {role === 'admin' && (
                  <div 
                    onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '15px' }}>⚙️</span> Admin Settings
                  </div>
                )}
                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                <div 
                  onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '15px' }}>🚪</span> Sign Out
                </div>
              </div>
            </div>
          )}
        </div>

        {/* "+ New Lead" — only on the Leads page */}
        {showNewLead && (
          <button
            className="btn btn-primary btn-sm"
            id="topbar-new-lead-btn"
            onClick={onNewLead}
            aria-label="Create new lead"
          >
            <span>+</span>
            <span>New Lead</span>
          </button>
        )}

      </div>
    </div>
  )
}
