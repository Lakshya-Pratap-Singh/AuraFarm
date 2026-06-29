// RankUpOverlay — full-screen celebration when the player's level
// increases. Self-contained: tracks the previous level itself via a ref,
// so it only needs to be rendered once near the top of the app (e.g.
// inside App.jsx, alongside Sidebar/BottomNav) — no props required.
//
// Deliberately doesn't touch XPContext.jsx — it just reads `level` from
// the existing useXP() hook and reacts to it changing, the same pattern
// XPWidget already uses for its own gain/loss toast (watch a value,
// self-clear after a timeout).
//
// Usage (e.g. in App.jsx, rendered once, anywhere — it's fixed/full-screen):
//   <RankUpOverlay />

import { useEffect, useRef, useState } from "react";
import { useXP } from "../context/XPContext.jsx";
import "../styles/rank-up.css";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5v-6l8-3z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12.5l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function RankUpOverlay() {
  const { level } = useXP();
  const previousLevelRef = useRef(level);
  const [visible, setVisible] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(level);

  useEffect(() => {
    // Skip the very first render — only react to an actual increase,
    // never fire just because the component mounted with some level.
    if (level > previousLevelRef.current) {
      setDisplayLevel(level);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2200);
      previousLevelRef.current = level;
      return () => clearTimeout(timer);
    }
    previousLevelRef.current = level;
  }, [level]);

  if (!visible) return null;

  return (
    <div className="rankup-overlay" role="status" aria-live="polite" onClick={() => setVisible(false)}>
      <div className="rankup-card">
        <div className="rankup-icon">
          <ShieldIcon />
        </div>
        <p className="rankup-eyebrow">RANK INCREASE</p>
        <h2 className="rankup-level">LEVEL {displayLevel}</h2>
        <p className="rankup-sub">Tap anywhere to dismiss</p>
      </div>
    </div>
  );
}

export default RankUpOverlay;