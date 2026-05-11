/**
 * components/MainLayout.jsx
 *
 * The authenticated app shell.  Mirrors the structure of LoanCRM_v9.html:
 *
 *   <aside class="sidebar">        ← <Sidebar>
 *   <div class="sidebar-overlay"> ← mobile backdrop
 *   <main class="main">
 *     <div class="topbar">        ← <Topbar>
 *     <div class="content">
 *       <Outlet />                ← child page renders here
 *     </div>
 *   </main>
 *
 * Responsibilities:
 *   • Manages sidebarOpen state (toggled by hamburger, closed by overlay click)
 *   • Passes onSearch down to the active page via the searchQuery context value
 *     so any page can consume the topbar search string without prop-drilling
 *   • Passes onNewLead handler to Topbar; Topbar shows it only on /leads
 *   • All original CSS class names preserved (sidebar, main, content, etc.)
 *
 * SearchContext:
 *   Exported so child pages can read the live search query:
 *
 *     import { useSearchQuery } from '../components/MainLayout'
 *     const searchQuery = useSearchQuery()
 */
import { useState, createContext, useContext, useCallback, useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'

// ── Search query context ───────────────────────────────────────────────────────
// Child pages (Leads, Clients…) subscribe to this to filter their tables
// as the user types in the topbar search box.
const SearchContext = createContext('')

export function useSearchQuery() {
  return useContext(SearchContext)
}

// ── New Lead modal context ─────────────────────────────────────────────────────
// The "+ New Lead" button lives in Topbar but the modal lives in the Leads page.
// This callback ref bridges them without prop-drilling through every route.
const NewLeadContext = createContext(null)

export function useNewLeadTrigger() {
  return useContext(NewLeadContext)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // The Leads page registers its "open new lead modal" callback here
  const [newLeadCallback, setNewLeadCallback] = useState(null)

  const registerNewLeadHandler = useCallback((fn) => {
    // useState with a function argument is called immediately, so wrap in
    // an arrow function to store the callback correctly.
    setNewLeadCallback(() => fn)
  }, [])

  function handleHamburger() {
    setSidebarOpen((prev) => !prev)
  }

  function handleOverlayClick() {
    setSidebarOpen(false)
  }

  function handleSearch(query) {
    setSearchQuery(query)
  }

  function handleNewLead() {
    newLeadCallback?.()
  }

  // ── Pull to Refresh ──
  const [pulling, setPulling] = useState(false)
  const touchStart = useRef(0)
  
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStart.current = e.touches[0].clientY
      } else {
        touchStart.current = 0
      }
    }

    const handleTouchMove = (e) => {
      if (touchStart.current === 0) return
      const currentY = e.touches[0].clientY
      const diff = currentY - touchStart.current
      if (diff > 50 && diff < 150) {
        setPulling(true)
      } else if (diff <= 50) {
        setPulling(false)
      }
    }

    const handleTouchEnd = (e) => {
      if (touchStart.current === 0) return
      const currentY = e.changedTouches[0].clientY
      const diff = currentY - touchStart.current
      if (diff > 100) {
        window.location.reload()
      }
      setPulling(false)
      touchStart.current = 0
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <NewLeadContext.Provider value={registerNewLeadHandler}>
      <SearchContext.Provider value={searchQuery}>

        {/* ── Offline indicator ── */}
        <OfflineBanner />

        {/* ── Sidebar ── */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Mobile overlay backdrop ── */}
        <div
          className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
          id="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* ── Main area ── */}
        <main className="main">

          {/* ── Topbar ── */}
          <Topbar
            onHamburger={handleHamburger}
            onSearch={handleSearch}
            onNewLead={handleNewLead}
          />

          {/* ── Page content ── */}
          <div className="content">
            {pulling && (
              <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'var(--surface)', padding: '10px 20px', borderRadius: 24, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ animation: 'spin 1s linear infinite', fontSize: 18 }}>↻</span> Release to refresh
              </div>
            )}
            <Outlet />
          </div>

          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>

        </main>

        {/* ── Mobile bottom navigation ── */}
        <BottomNav onMorePress={() => setSidebarOpen(true)} />

      </SearchContext.Provider>
    </NewLeadContext.Provider>
  )
}
