// BottomNav — mobile nav.
// Layout: Missions | Objectives | [center AF logo → Dashboard] | Intelligence | More
// The logo is a direct link to Dashboard (no menu). "More" opens a small
// popover listing the remaining pages (Relics, Settings).

import { useState } from "react";
import "../styles/bottom-nav.css";
import AuraLogoMark from "./AuraLogoMark.jsx";

const icons = {
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 3v18" strokeLinecap="round" />
      <path d="M5 4h11l-2.5 3.5L16 11H5" strokeLinejoin="round" />
    </svg>
  ),
  bars: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="5" y1="20" x2="5" y2="12" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="6" strokeLinecap="round" />
      <line x1="19" y1="20" x2="19" y2="14" strokeLinecap="round" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
    </svg>
  ),
  gem: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12l4 6-10 12L2 9Z" strokeLinejoin="round" />
      <path d="M2 9h20M9 3l3 6-3 12M15 3l-3 6 3 12" strokeLinejoin="round" />
    </svg>
  ),
};

// Direct tabs, left pair then right pair (logo sits between them)
const LEFT_ITEMS = [
  { label: "Missions",     icon: "target", shortLabel: "Missions" },
  { label: "Objectives",   icon: "flag",   shortLabel: "Objectives" },
];
const RIGHT_ITEMS = [
  { label: "Intelligence", icon: "bars",   shortLabel: "Intelligence" },
];

// "More" popover — remaining pages that don't get their own tab
const MENU_MORE = [
  { label: "Relics",   icon: "gem" },
  { label: "Settings", icon: "user" },
];

function NavBtn({ item, isActive, onClick }) {
  return (
    <button
      className={`bn-item ${isActive ? "bn-item--active" : ""}`}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="bn-item-icon">{icons[item.icon]}</span>
      <span className="bn-item-label">{item.shortLabel}</span>
    </button>
  );
}

function BottomNav({ activeNav, onNavChange }) {
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMore = () => setMoreOpen(false);

  const handleSelect = (label) => {
    onNavChange(label);
    closeMore();
  };

  const moreIsActive = moreOpen || ["Relics", "Settings"].includes(activeNav);

  return (
    <>
      {moreOpen && <div className="bn-menu-backdrop" onClick={closeMore} />}

      {moreOpen && (
        <div className="bn-menu-sheet" role="menu">
          {MENU_MORE.map((item) => (
            <button
              key={item.label}
              className={`bn-menu-item ${activeNav === item.label ? "bn-menu-item--active" : ""}`}
              onClick={() => handleSelect(item.label)}
              role="menuitem"
            >
              <span className="bn-menu-item-icon">{icons[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      <nav className="bn-root" aria-label="Main navigation">
        {LEFT_ITEMS.map((item) => (
          <NavBtn
            key={item.label}
            item={item}
            isActive={activeNav === item.label}
            onClick={() => onNavChange(item.label)}
          />
        ))}

        {/* Center raised AF logo — direct link to Dashboard */}
        <button
          className={`bn-center-btn ${activeNav === "Dashboard" ? "bn-center-btn--active" : ""}`}
          onClick={() => onNavChange("Dashboard")}
          aria-label="Dashboard"
          aria-current={activeNav === "Dashboard" ? "page" : undefined}
        >
          <span className="bn-center-inner">
            <AuraLogoMark size={28} />
          </span>
        </button>

        {RIGHT_ITEMS.map((item) => (
          <NavBtn
            key={item.label}
            item={item}
            isActive={activeNav === item.label}
            onClick={() => onNavChange(item.label)}
          />
        ))}

        {/* More — opens a small popover for the remaining pages */}
        <button
          className={`bn-item ${moreIsActive ? "bn-item--active" : ""}`}
          onClick={() => setMoreOpen((open) => !open)}
          aria-label="More pages"
          aria-expanded={moreOpen}
          aria-haspopup="true"
        >
          <span className="bn-item-icon">{icons.more}</span>
          <span className="bn-item-label">More</span>
        </button>
      </nav>
    </>
  );
}

export default BottomNav;