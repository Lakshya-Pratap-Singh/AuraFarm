// MissionFAB — bottom-right floating action button.
// Collapsed: single circular button. Tap expands a small mini-menu with
// "Create Mission" / "Create Objective". Tapping a menu item fires the
// matching callback and collapses; tapping the backdrop or the FAB again
// also collapses without firing anything.
//
// Deliberately knows nothing about mission/objective data shape or forms —
// it only calls onCreateMission / onCreateObjective, so wiring it up is
// just "open whatever creation UI already exists" (e.g. scroll to / focus
// the existing creation-panel on Missions.jsx, or open a modal — your call
// at the call site).
//
// Usage (e.g. in App.jsx, rendered once alongside Sidebar/BottomNav):
//   <MissionFAB
//     onCreateMission={() => navigate("/missions")}
//     onCreateObjective={() => navigate("/objectives")}
//   />

import { useState } from "react";
import "../styles/mission-fab.css";

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SwordIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14.5 2.5l7 7-14 14-3.5-3.5 14-14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 21l3-3" strokeLinecap="round" />
    <path d="M7.5 7L10 9.5" strokeLinecap="round" />
  </svg>
);

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 21V4" strokeLinecap="round" />
    <path d="M5 4h13l-3.5 4L18 12H5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function MissionFAB({ onCreateMission, onCreateObjective }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (callback) => {
    callback?.();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop — click-away to close, sits below the FAB/menu in z-index */}
      {isOpen && <div className="fab-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      <div className="fab-root">
        {/* Mini-menu — rendered above the FAB, expands upward */}
        <div className={`fab-menu ${isOpen ? "fab-menu--open" : ""}`}>
          <button
            className="fab-menu-item"
            style={{ "--fab-delay": "0.06s" }}
            onClick={() => handleSelect(onCreateObjective)}
          >
            <span className="fab-menu-icon">
              <FlagIcon />
            </span>
            Create Objective
          </button>
          <button
            className="fab-menu-item"
            style={{ "--fab-delay": "0s" }}
            onClick={() => handleSelect(onCreateMission)}
          >
            <span className="fab-menu-icon">
              <SwordIcon />
            </span>
            Create Mission
          </button>
        </div>

        <button
          className={`fab-trigger ${isOpen ? "fab-trigger--open" : ""}`}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close create menu" : "Open create menu"}
        >
          <PlusIcon />
        </button>
      </div>
    </>
  );
}

export default MissionFAB;