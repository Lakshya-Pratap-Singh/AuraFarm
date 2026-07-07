import { useState, useRef, useEffect } from 'react'
import '../styles/sidebar.css'
import { useAuth } from '../context/AuthContext.jsx'
import { useXP } from '../context/XPContext.jsx'
import AuraLogoMark from './AuraLogoMark.jsx'

// ─── Icon set ──────────────────────────────────────────────────────────────
const icons = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 21V4" strokeLinecap="round" />
      <path d="M5 4h13l-3.5 4L18 12H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12h4l2 7 4-14 2 7h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bars: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="5" y1="20" x2="5" y2="12" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="6" strokeLinecap="round" />
      <line x1="19" y1="20" x2="19" y2="14" strokeLinecap="round" />
    </svg>
  ),
  gem: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12l4 6-10 12L2 9Z" strokeLinejoin="round" />
      <path d="M2 9h20" />
      <path d="M9 3 8 9l4 12 4-12-1-6" strokeLinejoin="round" />
    </svg>
  ),
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l1.2 12.2a1.8 1.8 0 0 1-1.8 2H6.6a1.8 1.8 0 0 1-1.8-2L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.4-2-3.4-2.2.7a7.7 7.7 0 0 0-2.6-1.5L14 2h-4l-.5 2.4a7.7 7.7 0 0 0-2.6 1.5l-2.2-.7-2 3.4 1.9 1.4a7.6 7.6 0 0 0 0 3L2.7 14.9l2 3.4 2.2-.7c.77.65 1.65 1.16 2.6 1.5L10 22h4l.5-2.4c.95-.34 1.83-.85 2.6-1.5l2.2.7 2-3.4-1.9-1.4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

// Small chevron used on the footer's expand/menu trigger
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

// All 9 items per the mockup. Only the ones with a real page/route
// actually navigate — "Aura Shop", "Relics", and "Profile" are visible
// in the nav (per spec) but not wired to a destination yet; "Stats"
// routes to the existing Intelligence page, which is the same
// analytics/streak content the mockup's "Stats" tab shows on mobile.
const NAV_ITEMS = [
  { label: 'Dashboard',    icon: 'grid'   },
  { label: 'Missions',     icon: 'target' },
  { label: 'Objectives',   icon: 'flag'   },
  { label: 'Intelligence', icon: 'pulse'  },
  { label: 'Stats',        icon: 'bars'   },
  { label: 'Relics',       icon: 'gem'    },
  { label: 'Aura Shop',    icon: 'bag'    },
  { label: 'Profile',      icon: 'user'   },
  { label: 'Settings',     icon: 'gear'   },
]

function Sidebar({ activeNav, onNavChange }) {
  const { user, logout } = useAuth()
  const { level } = useXP()
  const [menuOpen, setMenuOpen] = useState(false)
  const footerRef = useRef(null)

  // Close the footer menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (footerRef.current && !footerRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <aside className="sidebar">

      {/* ── Brand block ──────────────────────────────────────────── */}
      <div className="sb-brand">
        <span className="sb-mark" aria-hidden="true">
          <AuraLogoMark size={40} />
        </span>
        <div className="sb-brand-text">
          <span className="sb-logo">AURA<span className="sb-purple">FARM</span></span>
          <span className="sb-tagline">BUILD. DISCIPLINE. BECOME.</span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="sb-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.label
          return (
            <button
              key={item.label}
              className={`sb-item ${isActive ? 'sb-item--active' : ''}`}
              onClick={() => onNavChange(item.label)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sb-item-icon">{icons[item.icon]}</span>
              <span className="sb-item-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── Footer — Cultivator identity + Aura Level pill ────────── */}
      <div className="sb-footer" ref={footerRef}>
        <button
          className="sb-footer-trigger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {user?.photoURL ? (
            <img
              className="sb-avatar"
              src={user.photoURL}
              alt={user.displayName || 'Cultivator'}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="sb-avatar sb-avatar--placeholder" aria-hidden="true">
              <AuraLogoMark size={20} />
            </span>
          )}

          <span className="sb-footer-text">
            <span className="sb-footer-title">{user?.displayName || 'Shadow'}</span>
            <span className="sb-footer-level-pill">Aura Level {level}</span>
          </span>

          <span className={`sb-footer-chevron ${menuOpen ? 'sb-footer-chevron--open' : ''}`}>
            <ChevronDown />
          </span>
        </button>

        {menuOpen && (
          <div className="sb-footer-menu" role="menu">
            <button className="sb-footer-menu-item" onClick={logout} role="menuitem">
              <LogoutIcon />
              Log out
            </button>
          </div>
        )}
      </div>

    </aside>
  )
}

export default Sidebar;