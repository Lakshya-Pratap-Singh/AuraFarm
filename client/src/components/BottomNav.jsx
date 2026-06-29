// BottomNav — mobile nav, drop-in replacement for <Sidebar> below 768px.
//
// Deliberately mirrors Sidebar's prop contract exactly:
//   activeNav, onNavChange
// so the parent (App.jsx) doesn't need any routing changes — just render
// this instead of <Sidebar> when useBreakpoint().isMobile is true. Icons
// are duplicated locally (not imported from Sidebar) to keep this
// component self-contained and avoid touching the existing file.
//
// Usage (in App.jsx, alongside existing Sidebar usage):
//   const { isMobile } = useBreakpoint();
//   {isMobile
//     ? <BottomNav activeNav={activeNav} onNavChange={setActiveNav} badges={{ Missions: 3 }} />
//     : <Sidebar activeNav={activeNav} onNavChange={setActiveNav} isCollapsed={isCollapsed} onToggle={toggle} />}

import { useEffect, useRef, useState } from "react";
import "../styles/bottom-nav.css";

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
};

// Same labels/order as Sidebar's NAV_ITEMS — keep these two lists in sync
// if nav items ever change.
const NAV_ITEMS = [
  { label: "Command Center", icon: "grid" },
  { label: "Missions", icon: "target" },
  { label: "Objectives", icon: "flag" },
  { label: "Intelligence", icon: "pulse" },
  { label: "Settings", icon: "gear" },
];

function BottomNav({ activeNav, onNavChange, badges = {} }) {
  const itemRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: "translateX(0)" });

  const activeIndex = NAV_ITEMS.findIndex((item) => item.label === activeNav);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el) return;
    setIndicatorStyle({
      width: el.offsetWidth,
      transform: `translateX(${el.offsetLeft}px)`,
    });
  }, [activeIndex]);

  return (
    <nav className="bn-root" aria-label="Main navigation">
      {/* Floating active indicator — single element, slides via transform */}
      <span className="bn-indicator" style={indicatorStyle} aria-hidden="true" />

      {NAV_ITEMS.map((item, i) => {
        const isActive = activeNav === item.label;
        const badgeCount = badges[item.label];

        return (
          <button
            key={item.label}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`bn-item ${isActive ? "bn-item--active" : ""}`}
            onClick={() => onNavChange(item.label)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bn-item-icon">
              {icons[item.icon]}
              {badgeCount > 0 && (
                <span className="bn-badge">{badgeCount > 9 ? "9+" : badgeCount}</span>
              )}
            </span>
            <span className="bn-item-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;