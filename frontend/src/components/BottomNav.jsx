/**
 * components/BottomNav.jsx
 *
 * mobile-only bottom navigation bar for native app experience
 * visible only on viewports <= 768px
 * replaces the sidebar on mobile
 *
 * tabs: dashboard, leads, pipeline, more (opens drawer)
 * 48px touch targets for store compliance
 * safe area padding for ios notch
 */
import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { key: 'dashboard', icon: '📊', label: 'Home',     path: '/dashboard' },
  { key: 'leads',     icon: '🎯', label: 'Leads',    path: '/leads' },
  { key: 'pipeline',  icon: '🔄', label: 'Pipeline', path: '/pipeline' },
  { key: 'more',      icon: '☰',  label: 'More',     path: null },
]

export default function BottomNav({ onMorePress }) {
  const navigate = useNavigate()
  const location = useLocation()
  const activePath = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard'

  function handleTap(tab) {
    if (tab.path) {
      navigate(tab.path)
    } else {
      onMorePress?.()
    }
  }

  return (
    <nav className="bottom-nav" id="bottom-nav" aria-label="Mobile navigation">
      {TABS.map((tab) => {
        const isActive = tab.path && activePath === tab.key
        return (
          <button
            key={tab.key}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => handleTap(tab)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.label}
            id={`bnav-${tab.key}`}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
