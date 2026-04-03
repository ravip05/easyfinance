/**
 * components/Sidebar.jsx
 *
 * Faithful React conversion of the <aside class="sidebar"> in LoanCRM_v9.html.
 *
 * Features preserved from the prototype:
 *   ✓ Role-based navigation built from ROLE_CONFIG (same structure, same pages)
 *   ✓ Section group headers (nav-section)
 *   ✓ Nav item badges (nb-orange, nb-green)
 *   ✓ Active item highlight with the blue left-border stripe
 *   ✓ User avatar + name + role label in sidebar-bottom
 *   ✓ Settings and Logout icon buttons in the footer
 *   ✓ Mobile: renders as an off-canvas drawer controlled by isOpen prop
 *   ✓ All original CSS class names preserved
 *
 * Changes from the prototype:
 *   • buildSidebar() → renders JSX from ROLE_CONFIG instead of innerHTML
 *   • showPage() → <Link> / useNavigate() instead of DOM display toggles
 *   • Active item detected via useLocation instead of a global variable
 *   • Role pill computed from user.role instead of innerHTML mutation
 */
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── ROLE_CONFIG ────────────────────────────────────────────────────────────────
// Direct JS port of the ROLE_CONFIG constant from the prototype.
// Keys: s = section label, i = items array
//   p  = page key (maps to a /route path below)
//   ic = icon emoji
//   l  = label string
//   b  = badge text (optional)
//   bc = badge CSS class (optional)
const ROLE_CONFIG = {
  admin: {
    label: 'Super Admin', pill: 'rp-admin', icon: '🛡️',
    nav: [
      { s: 'Main',       i: [{ p: 'dashboard',    ic: '📊', l: 'Dashboard' }] },
      { s: 'Leads',      i: [{ p: 'leads',        ic: '🎯', l: 'Lead Management', b: '', bc: 'nb-orange' },
                              { p: 'pipeline',     ic: '🔄', l: 'Pipeline View' },
                              { p: 'duplicates',   ic: '🔍', l: 'Dup. Checker' }] },
      { s: 'Clients',    i: [{ p: 'clients',      ic: '👤', l: 'Client Profiles' }] },
      { s: 'Tools',      i: [{ p: 'calculator',   ic: '🧮', l: 'Loan Calculator' },
                              { p: 'cibil',        ic: '📈', l: 'CIBIL Checker', b: 'New', bc: 'nb-green' }] },
      { s: 'Team',       i: [{ p: 'employees',    ic: '👥', l: 'Employees' },
                              { p: 'franchise',    ic: '🏢', l: 'Franchise' }] },
      { s: 'Knowledge',  i: [{ p: 'lms',          ic: '🎓', l: 'Training & LMS', b: 'New', bc: 'nb-green' },
                              { p: 'bankpolicies', ic: '🏦', l: 'Bank Policies' },
                              { p: 'policy-management', ic: '🛠️', l: 'Policy Admin' }] },
      { s: 'Analytics',  i: [{ p: 'reports',      ic: '📋', l: 'Reports' }] },
      { s: 'Comms',      i: [{ p: 'announcements',ic: '📢', l: 'Announcements', b: '', bc: 'nb-orange' },
                              { p: 'team-chat',    ic: '💬', l: 'Team Chat', b: 'New', bc: 'nb-green' }] },
      { s: 'HR & Ops',   i: [{ p: 'hr',           ic: '🏢', l: 'HR Module' },
                              { p: 'tasks',        ic: '📋', l: 'Task Board', b: 'New', bc: 'nb-green' },
                              { p: 'idcard',       ic: '🪪', l: 'ID Cards' }] },
      { s: 'System',     i: [{ p: 'settings',     ic: '⚙️', l: 'Admin Settings' }] },
    ],
  },
  manager: {
    label: 'Manager', pill: 'rp-manager', icon: '👔',
    nav: [
      { s: 'Main',       i: [{ p: 'dashboard',    ic: '📊', l: 'Dashboard' }] },
      { s: 'Leads',      i: [{ p: 'leads',        ic: '🎯', l: 'Lead Management', b: '', bc: 'nb-orange' },
                              { p: 'pipeline',     ic: '🔄', l: 'Pipeline View' },
                              { p: 'duplicates',   ic: '🔍', l: 'Dup. Checker' }] },
      { s: 'Clients',    i: [{ p: 'clients',      ic: '👤', l: 'Client Profiles' }] },
      { s: 'Tools',      i: [{ p: 'calculator',   ic: '🧮', l: 'Loan Calculator' },
                              { p: 'cibil',        ic: '📈', l: 'CIBIL Checker' }] },
      { s: 'Team',       i: [{ p: 'employees',    ic: '👥', l: 'My Team' }] },
      { s: 'Knowledge',  i: [{ p: 'lms',          ic: '🎓', l: 'Training & LMS' },
                              { p: 'bankpolicies', ic: '🏦', l: 'Bank Policies' }] },
      { s: 'Analytics',  i: [{ p: 'reports',      ic: '📋', l: 'Reports' }] },
      { s: 'Comms',      i: [{ p: 'announcements',ic: '📢', l: 'Announcements' },
                              { p: 'team-chat',    ic: '💬', l: 'Team Chat', b: 'New', bc: 'nb-green' }] },
      { s: 'HR & Ops',   i: [{ p: 'hr',           ic: '🏢', l: 'HR Module' },
                              { p: 'tasks',        ic: '📋', l: 'Task Board', b: 'New', bc: 'nb-green' },
                              { p: 'idcard',       ic: '🪪', l: 'ID Cards' }] },
    ],
  },
  staff: {
    label: 'Staff / Executive', pill: 'rp-staff', icon: '👤',
    nav: [
      { s: 'Main',       i: [{ p: 'dashboard',    ic: '📊', l: 'My Dashboard' }] },
      { s: 'My Leads',   i: [{ p: 'leads',        ic: '🎯', l: 'My Leads' },
                              { p: 'pipeline',     ic: '🔄', l: 'Pipeline' }] },
      { s: 'Clients',    i: [{ p: 'clients',      ic: '👤', l: 'My Clients' }] },
      { s: 'Tools',      i: [
        { p: 'calculator',   ic: '🧮', l: 'Loan Calculator' },
        { p: 'cibil',        ic: '📈', l: 'CIBIL Checker' },
        { p: 'idcard',       ic: '🪪', l: 'My ID Card' }
      ] },
      { s: 'Learn',      i: [{ p: 'lms',          ic: '🎓', l: 'Training & LMS', b: '2', bc: 'nb-orange' },
                              { p: 'bankpolicies', ic: '🏦', l: 'Bank Policies' }] },
      { s: 'Comms',      i: [{ p: 'announcements',ic: '📢', l: 'Announcements' },
                              { p: 'team-chat',    ic: '💬', l: 'Team Chat', b: 'New', bc: 'nb-green' }] },
      { s: 'My HR',      i: [{ p: 'myattendance', ic: '📅', l: 'My Attendance' },
                              { p: 'tasks',        ic: '📋', l: 'My Tasks' }] },
    ],
  },
  dsa: {
    label: 'DSA Partner', pill: 'rp-dsa', icon: '🤝',
    nav: [
      { s: 'Main',       i: [{ p: 'dashboard',    ic: '📊', l: 'My Dashboard' }] },
      { s: 'My Leads',   i: [{ p: 'leads',        ic: '🎯', l: 'My Leads' },
                              { p: 'pipeline',     ic: '🔄', l: 'Pipeline' }] },
      { s: 'Tools',      i: [
        { p: 'calculator',   ic: '🧮', l: 'Loan Calculator' },
        { p: 'cibil',        ic: '📈', l: 'CIBIL Checker' },
        { p: 'idcard',       ic: '🪪', l: 'My ID Card' }
      ] },
      { s: 'Learn',      i: [{ p: 'lms',          ic: '🎓', l: 'Training & LMS' },
                              { p: 'bankpolicies', ic: '🏦', l: 'Bank Policies' }] },
      { s: 'Comms',      i: [{ p: 'announcements',ic: '📢', l: 'Announcements' }] },
      { s: 'My HR',      i: [{ p: 'myattendance', ic: '📅', l: 'My Attendance' }] },
    ],
  },
  client: {
    label: 'Client', pill: 'rp-client', icon: '🧑',
    nav: [
      { s: 'Main',       i: [{ p: 'dashboard',    ic: '📊', l: 'My Dashboard' }] },
      { s: 'My Loans',   i: [{ p: 'clients',      ic: '📋', l: 'My Applications' }] },
      { s: 'Tools',      i: [{ p: 'calculator',   ic: '🧮', l: 'Loan Calculator' }] },
      { s: 'Support',    i: [{ p: 'tickets',      ic: '🎫', l: 'Support Tickets' }] },
      { s: 'Comms',      i: [{ p: 'announcements',ic: '📢', l: 'Announcements' }] },
    ],
  },
}

// ── Page → route path mapping ──────────────────────────────────────────────────
// Maps the short page keys from ROLE_CONFIG to their React Router paths.
const PAGE_ROUTES = {
  dashboard:    '/dashboard',
  leads:        '/leads',
  clients:      '/clients',
  pipeline:     '/pipeline',
  employees:    '/employees',
  franchise:    '/franchise',
  bankpolicies: '/bankpolicies',
  lms:          '/lms',
  reports:      '/reports',
  announcements:'/announcements',
  calculator:   '/calculator',
  cibil:        '/cibil',
  settings:     '/settings',
  hr:           '/hr',
  duplicates:   '/duplicates',
  idcard:       '/idcard',
  myattendance: '/myattendance',
  tickets:      '/tickets',
  'policy-management': '/policy-management',
  profile:      '/profile',
  tasks:        '/tasks',
  'team-chat':  '/team-chat',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // Fall back to 'staff' if role is somehow undefined
  const role       = user?.role ?? 'staff'
  let roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.staff
  
  if (role !== 'admin' && Array.isArray(user?.module_access)) {
      const allowed = new Set(user.module_access);
      const pageToMod = {
         dashboard: 'dashboard', leads: 'leads', duplicates: 'leads', clients: 'clients',
         pipeline: 'pipeline', tasks: 'tasks', hr: 'hr', idcard: 'hr', myattendance: 'hr',
         reports: 'reports', lms: 'lms', bankpolicies: 'lms', tickets: 'tickets', announcements: 'announcements'
      };
       const filteredNav = roleConfig.nav.map(section => ({
           ...section,
           i: section.i.filter(item => {
               // Absolute bypass for ID Card - must be visible for all roles who have it in their config
               if (item.p === 'idcard') return true;
               
               const mod = pageToMod[item.p];
               if (mod && !allowed.has(mod)) return false;
               return true;
           })
       })).filter(section => section.i.length > 0);
       
       roleConfig = { ...roleConfig, nav: filteredNav };
   }


  // Current path segment (e.g. "/leads" → "leads") for active detection
  const activePath = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard'

  function handleNavClick(pageKey) {
    navigate(PAGE_ROUTES[pageKey] ?? `/${pageKey}`)
    onClose?.()   // close drawer on mobile after navigation
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  function handleSettings() {
    navigate('/settings')
    onClose?.()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <aside
      className={`sidebar${isOpen ? ' open' : ''}`}
      id="sidebar"
      aria-label="Main navigation"
    >
      {/* ── Logo bar ── */}
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <div className="logo-text">
          EasyFinance CRM<span>Loan Consultancy · v2.0</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav" id="sidebar-nav">
        {roleConfig.nav.map((group) => (
          <div className="nav-group" key={group.s}>
            <div className="nav-section">{group.s}</div>
            {group.i.map((item) => {
              const isActive = activePath === item.p
              return (
                <div
                  key={item.p}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => handleNavClick(item.p)}
                  data-page={item.p}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavClick(item.p)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.ic}</span>
                  <span className="nav-label">{item.l}</span>
                  {/* Badge (e.g. "New", "12") — only rendered when text is non-empty */}
                  {item.b !== undefined && item.b !== '' && (
                    <span className={`nav-badge ${item.bc}`}>{item.b}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: user info + actions ── */}
      <div className="sidebar-bottom">
        {/* Avatar with user initials */}
        <div 
          className="user-avatar" 
          id="sb-avatar" 
          onClick={() => handleNavClick('profile')}
          style={{ cursor: 'pointer' }}
          title="My Account"
        >
          {user?.initials ?? user?.name?.slice(0, 2).toUpperCase() ?? '??'}
        </div>

        {/* Name + role label */}
        <div 
          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} 
          onClick={() => handleNavClick('profile')}
          title="My Account"
        >
          <div className="user-name" id="sb-name">
            {user?.name ?? '—'}
          </div>
          <div className="user-role" id="sb-role-lbl">
            {roleConfig.label}
          </div>
        </div>

        {/* Settings button (admin only) */}
        {role === 'admin' && (
          <button
            className="icon-btn"
            title="Admin Settings"
            onClick={handleSettings}
            id="sb-settings-btn"
            aria-label="Admin Settings"
            style={{ flexShrink: 0 }}
          >
            ⚙️
          </button>
        )}

        {/* Logout button */}
        <button
          className="icon-btn"
          title="Sign Out"
          onClick={handleLogout}
          id="sb-logout-btn"
          aria-label="Sign out"
          style={{ flexShrink: 0 }}
        >
          🚪
        </button>
      </div>
    </aside>
  )
}
