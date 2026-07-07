// BottomNav — mobile nav matching the AuraFarm mockup exactly.
// Layout: Dashboard | Missions | [center AF logo button] | Stats | Profile
// The center AF logo is a raised circular button, slightly above the bar.

import "../styles/bottom-nav.css";
import AuraLogoMark from "./AuraLogoMark.jsx";

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
  bars: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="5" y1="20" x2="5" y2="12" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="6" strokeLinecap="round" />
      <line x1="19" y1="20" x2="19" y2="14" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
    </svg>
  ),
};

// Left 2 + right 2 tabs (center slot is the logo button)
const LEFT_ITEMS  = [
  { label: "Dashboard", icon: "grid",   shortLabel: "Dashboard" },
  { label: "Missions",  icon: "target", shortLabel: "Missions"  },
];
const RIGHT_ITEMS = [
  { label: "Stats",   icon: "bars", shortLabel: "Stats"   },
  { label: "Profile", icon: "user", shortLabel: "Profile" },
];

function NavBtn({ item, isActive, onNavChange }) {
  return (
    <button
      className={`bn-item ${isActive ? "bn-item--active" : ""}`}
      onClick={() => onNavChange(item.label)}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="bn-item-icon">{icons[item.icon]}</span>
      <span className="bn-item-label">{item.shortLabel}</span>
    </button>
  );
}

function BottomNav({ activeNav, onNavChange }) {
  return (
    <nav className="bn-root" aria-label="Main navigation">
      {/* Left 2 tabs */}
      {LEFT_ITEMS.map((item) => (
        <NavBtn
          key={item.label}
          item={item}
          isActive={activeNav === item.label}
          onNavChange={onNavChange}
        />
      ))}

      {/* Center raised AF logo button */}
      <button
        className="bn-center-btn"
        onClick={() => onNavChange("Dashboard")}
        aria-label="Home — Dashboard"
      >
        <span className="bn-center-inner">
          <AuraLogoMark size={28} />
        </span>
      </button>

      {/* Right 2 tabs */}
      {RIGHT_ITEMS.map((item) => (
        <NavBtn
          key={item.label}
          item={item}
          isActive={activeNav === item.label}
          onNavChange={onNavChange}
        />
      ))}
    </nav>
  );
}

export default BottomNav;