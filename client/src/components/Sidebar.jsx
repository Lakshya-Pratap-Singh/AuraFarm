import '../styles/sidebar.css'
import { useAuth } from '../context/AuthContext.jsx'

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

// Chevron icons for the collapse toggle button
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

// Logout icon for the footer button
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

const NAV_ITEMS = [
  { label: 'Command Center', icon: 'grid'   },
  { label: 'Missions',       icon: 'target' },
  { label: 'Objectives',     icon: 'flag'   },
  { label: 'Intelligence',   icon: 'pulse'  },
  { label: 'Settings',       icon: 'gear'   },
]

function Sidebar({ activeNav, onNavChange, isCollapsed, onToggle }) {
  const { user, logout } = useAuth()

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>

      {/* ── Brand block ──────────────────────────────────────────── */}
      <div className="sb-brand">
        {/* Bat icon — always visible */}
        <span className="sb-bat" aria-hidden="true">
          <svg viewBox="0 0 64 32" fill="currentColor">
            <path d="M32 6c-1.6-2.6-4.3-4.4-7.4-4.8 1 1.6 1.6 3.4 1.8 5.2-4-1.4-8.6-1-12 1.4 2.6.2 5 1.2 7 2.8C16 9.8 9.6 9.2 4 12c4 .4 7.8 2 11 4.4-3.4.6-6.6 2.2-9 4.6 3.6-.8 7.4-.6 10.8.8-2 2-3.2 4.6-3.4 7.4 2-2.4 4.6-4.2 7.6-5.2.8 2 2.2 3.8 4 5 .4-2 1.4-3.8 2.8-5.2L29 32l3-7.2 3 7.2 1.2-8.2c1.4 1.4 2.4 3.2 2.8 5.2 1.8-1.2 3.2-3 4-5 3 1 5.6 2.8 7.6 5.2-.2-2.8-1.4-5.4-3.4-7.4 3.4-1.4 7.2-1.6 10.8-.8-2.4-2.4-5.6-4-9-4.6 3.2-2.4 7-4 11-4.4-5.6-2.8-12-3.4-17.4-1.4 2-1.6 4.4-2.6 7-2.8-3.4-2.4-8-2.8-12-1.4.2-1.8.8-3.6 1.8-5.2C36.3 1.6 33.6 3.4 32 6Z" />
          </svg>
        </span>

        {/* Title — hidden when collapsed */}
        <div className="sb-brand-text">
          <span className="sb-logo">DAILY<span className="sb-gold">WISE</span></span>
          <span className="sb-tagline">TACTICAL DISCIPLINE</span>
        </div>
      </div>

      {/* ── Collapse toggle ───────────────────────────────────────── */}
      <button
        className="sb-toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="sb-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.label
          return (
            <button
              key={item.label}
              className={`sb-item ${isActive ? 'sb-item--active' : ''}`}
              onClick={() => onNavChange(item.label)}
              title={isCollapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sb-item-icon">{icons[item.icon]}</span>
              <span className="sb-item-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── Footer — authenticated operative identity + logout ───── */}
      <div className="sb-footer">
        {user?.photoURL ? (
          <img
            className="sb-avatar"
            src={user.photoURL}
            alt={user.displayName || 'Operative'}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="sb-status-dot" />
        )}

        <div className="sb-footer-text">
          <p className="sb-footer-title">{user?.displayName || 'Operative'}</p>
          <p className="sb-footer-sub">{user?.email || 'Gotham · Sector 07'}</p>
        </div>

        <button
          className="sb-logout"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
        >
          <LogoutIcon />
        </button>
      </div>

    </aside>
  )
}

export default Sidebar;