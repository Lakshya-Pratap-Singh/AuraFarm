// XPWidget — reusable Level/XP display for the Command Center dashboard.
// Pulls all numbers from XPContext; has no knowledge of missions itself,
// so it can be dropped into other pages (Settings, a profile page, etc.)
// without changes.

import { useEffect, useState } from "react";
import { useXP } from "../context/XPContext.jsx";
import "../styles/xp-widget.css";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5v-6l8-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12.5l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XPWidget() {
  const { totalXP, level, xpIntoLevel, xpNeededForNextLevel, progressPercent, xpPerLevel, lastGain } = useXP();

  // Transient floating "+25 XP" / "-25 XP" popup, driven by lastGain
  // changing in context. Owns its own visibility/timeout so the context
  // doesn't need to know about animation timing at all.
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!lastGain) return;
    setToast(lastGain);
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [lastGain]);

  const isLoss = toast && toast.amount < 0;

  return (
    <div className="xp-widget">
      {/* Animated XP gain/loss popup */}
      {toast && (
        <div
          key={toast.key}
          className={`xp-toast ${isLoss ? "xp-toast--loss" : "xp-toast--gain"}`}
          aria-live="polite"
        >
          {isLoss ? "" : "+"}{toast.amount} XP
        </div>
      )}

      <div className="xp-widget-row">
        {/* Level badge */}
        <div className="xp-badge" aria-label={`Level ${level}`}>
          <ShieldIcon />
          <div className="xp-badge-text">
            <span className="xp-badge-label">LVL</span>
            <span className="xp-badge-level">{level}</span>
          </div>
        </div>

        {/* Progress section */}
        <div className="xp-progress-block">
          <div className="xp-progress-header">
            <span className="xp-progress-title">OPERATIVE PROGRESS</span>
            <span className="xp-progress-percent">{progressPercent}%</span>
          </div>

          <div className="xp-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="xp-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="xp-progress-footer">
            <span className="xp-stat">
              <span className="xp-stat-value">{xpIntoLevel}</span>
              <span className="xp-stat-label">CURRENT XP</span>
            </span>
            <span className="xp-stat">
              <span className="xp-stat-value">{xpNeededForNextLevel}</span>
              <span className="xp-stat-label">XP TO LEVEL {level + 1}</span>
            </span>
            <span className="xp-stat">
              <span className="xp-stat-value">{totalXP}</span>
              <span className="xp-stat-label">TOTAL XP</span>
            </span>
            <span className="xp-stat">
              <span className="xp-stat-value">{xpPerLevel}</span>
              <span className="xp-stat-label">XP / LEVEL</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default XPWidget;