import {
  PRIORITY_CONFIG,
  DIFFICULTY_CONFIG,
  CATEGORY_CONFIG,
} from "../pages/Missions.jsx";
import { MISSION_XP_TABLE } from "../context/XPContext.jsx";
import useSwipeGesture from "../hooks/useSwipeGesture.js";
import { useEffect, useState } from "react";
import "../styles/missions.css";
import "../styles/mission-swipe.css";

// CHANGED: whole card is now the drag surface (Samsung call-log style),
// not just a slider living inside .card-actions. Works identically for
// touch and mouse via pointer events — no isMobile branching needed, so
// useBreakpoint is no longer imported here.
//
// The COMPLETE/REOPEN button stays visible on every breakpoint now (it
// used to be desktop-only, with SwipeToComplete taking over on mobile).
// Swipe is an added fast-path, not a replacement — keeps keyboard/no-drag
// completion working everywhere. SwipeToComplete.jsx itself is untouched
// and still exported/available if you want it back for any other view.

const PROGRESS_THRESHOLD = 0.5;   // orange glow starts here
const COMPLETE_THRESHOLD = 0.85;  // green glow + actual completion fires here on release

const SwordIcon = () => (
  <svg className="card-sword" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M14.5 2.5l7 7-14 14-3.5-3.5 14-14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 21l3-3" strokeLinecap="round" />
    <path d="M7.5 7L10 9.5" strokeLinecap="round" />
  </svg>
);

const StatusIndicator = ({ completed }) => (
  <div className={`status-indicator ${completed ? "status-indicator--complete" : "status-indicator--active"}`}>
    <span className="status-indicator-ring" />
    <span className="status-indicator-dot" />
  </div>
);

const SwipeHintIcon = () => (
  <svg className="mc-swipe-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 17l5-5-5-5M13 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function MissionCard({ mission, linkedObjectiveName, onComplete, onDelete }) {
  const priorityCfg = PRIORITY_CONFIG[mission.priority] || PRIORITY_CONFIG.Medium;
  const difficultyCfg =
    DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.Normal;
  const categoryCfg =
    CATEGORY_CONFIG[mission.category] || CATEGORY_CONFIG.Learning;
  const xpReward = MISSION_XP_TABLE[mission.difficulty] || MISSION_XP_TABLE.Normal;

  // Transient post-completion celebration — watches the completed prop
  // transition false→true (driven by Missions.jsx's state, same pattern
  // XPWidget uses for its own toast) and self-clears, so no parent wiring
  // is needed beyond the existing onComplete callback.
  const [justCompleted, setJustCompleted] = useState(false);
  useEffect(() => {
    if (mission.completed) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 900);
      return () => clearTimeout(timer);
    }
  }, [mission.completed]);

  const { trackRef, dragX, trackWidth, isDragging, handlers } = useSwipeGesture({
    disabled: mission.completed, // completed cards aren't draggable — reopen is button-only (see file header note)
    ignoreSelector: ".btn-card", // pointerdown on Complete/Reopen/Delete buttons is never hijacked into a drag
    onRelease: (finalX, finalWidth) => {
      const percent = finalWidth > 0 ? finalX / finalWidth : 0;
      if (percent >= COMPLETE_THRESHOLD) {
        onComplete(mission.id);
      }
    },
  });

  const swipePercent = trackWidth > 0 ? Math.min(dragX / trackWidth, 1) : 0;
  const swipeStage =
    swipePercent >= COMPLETE_THRESHOLD ? "ready" : swipePercent >= PROGRESS_THRESHOLD ? "progress" : "idle";

  const cardClass = [
    "mission-card-tactial",
    mission.completed ? "mission-card-tactial--completed" : "mission-card-tactial--active",
    isDragging ? "mission-card-tactial--dragging" : "",
    isDragging ? `mc-swipe-stage--${swipeStage}` : "",
    justCompleted ? "mc-celebrate" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      ref={trackRef}
      className={cardClass}
      style={isDragging ? { transform: `translateX(${dragX}px)` } : undefined}
      {...handlers}
    >
      <div className="card-accent-bar" />

      {/* Swipe affordance — fades in only while actively dragging past the
          start threshold, gives a visual "you're swiping" confirmation
          without adding any always-visible chrome to the resting card */}
      {isDragging && (
        <div className="mc-swipe-overlay" aria-hidden="true">
          <SwipeHintIcon />
          <span className="mc-swipe-overlay-text">
            {swipeStage === "ready" ? "RELEASE TO COMPLETE" : "KEEP SWIPING"}
          </span>
        </div>
      )}

      <div className="card-header">
        <div className="card-title-row">
          <SwordIcon />
          <h3 className="card-title">{mission.title.toUpperCase()}</h3>
        </div>
        <StatusIndicator completed={mission.completed} />
      </div>

      <div className="card-meta">
        {linkedObjectiveName && (
          <span className="card-meta-item card-objective">
            <svg className="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
            </svg>
            {linkedObjectiveName.toUpperCase()}
          </span>
        )}
        <span className={`card-status-pill ${mission.completed ? "pill-complete" : "pill-active"}`}>
          {mission.completed ? "COMPLETED" : "ACTIVE"}
        </span>
      </div>

      <div className="card-badges-row">
        <span className={`card-badge card-badge--priority ${priorityCfg.accent}`}>
          {priorityCfg.label}
        </span>
        <span className={`card-badge card-badge--difficulty ${difficultyCfg.accent}`}>
          {difficultyCfg.label}
        </span>
        <span className={`card-badge card-badge--category ${categoryCfg.accent}`}>
          {categoryCfg.label}
        </span>
      </div>

      <div className="card-xp-row">
        <span className="card-xp-pill">⚡ +{xpReward} XP</span>
      </div>

      <div className="card-actions">
        <button
          className={`btn-card ${mission.completed ? "btn-card--reopen" : "btn-card--complete"}`}
          onClick={() => onComplete(mission.id)}
          aria-label={mission.completed ? "Reopen mission" : "Complete mission"}
        >
          {mission.completed ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              REOPEN
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              COMPLETE
            </>
          )}
        </button>

        <button
          className="btn-card btn-card--delete"
          onClick={() => onDelete(mission.id)}
          aria-label="Delete mission"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          DELETE
        </button>
      </div>
    </article>
  );
}

export default MissionCard;