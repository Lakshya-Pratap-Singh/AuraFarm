import useSwipeGesture from "../hooks/useSwipeGesture.js";
import "../styles/swipe-to-complete.css";

const THUMB_WIDTH = 52; // px — must match .stc-thumb width in swipe-to-complete.css
const COMPLETE_THRESHOLD = 0.72; // fraction of available travel needed to trigger completion

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReopenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronsRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 17l5-5-5-5M13 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// SwipeToComplete — mobile-only replacement for the COMPLETE button.
// Swipe right past the threshold to complete; when already completed,
// renders as a static "tap to reopen" pill instead of a draggable track
// (reverse-swipe-to-reopen would be directionally ambiguous, and the
// desktop button already covers reopening unambiguously via a click).
//
// Calls the exact same toggle the desktop button uses — onToggle here
// IS onComplete(mission.id) from MissionCard, just renamed locally since
// this component also uses it to reopen. No new completion/XP logic;
// that all still lives in Missions.jsx's handleCompleteMission.
function SwipeToComplete({ completed, onToggle, label = "mission" }) {
  const { trackRef, dragX, trackWidth, isDragging, handlers } = useSwipeGesture({
    disabled: completed,
    onRelease: (finalX, finalTrackWidth) => {
      const maxTravel = Math.max(finalTrackWidth - THUMB_WIDTH, 1);
      const percent = Math.min(finalX / maxTravel, 1);
      if (percent >= COMPLETE_THRESHOLD) {
        onToggle();
      }
    },
  });

  const maxTravel = Math.max(trackWidth - THUMB_WIDTH, 1);
  const thumbX = Math.min(dragX, maxTravel);
  // Fill only animates while actively dragging — settles back to 0 on
  // release whether or not the swipe completed, since a completed
  // mission immediately re-renders into the branch below instead.
  const fillPercent = isDragging ? Math.min((dragX / maxTravel) * 100, 100) : 0;

  if (completed) {
    return (
      <button
        type="button"
        className="stc-track stc-track--completed"
        onClick={onToggle}
        aria-label={`Reopen ${label}`}
      >
        <span className="stc-completed-icon">
          <CheckIcon />
        </span>
        <span className="stc-completed-text">COMPLETED — TAP TO REOPEN</span>
      </button>
    );
  }

  return (
    <div
      ref={trackRef}
      className={`stc-track ${isDragging ? "stc-track--dragging" : ""}`}
      style={{ "--stc-fill": `${fillPercent}%` }}
    >
      <span className="stc-track-label">SWIPE TO COMPLETE</span>
      <div
        className="stc-thumb"
        style={{ transform: `translateX(${thumbX}px)` }}
        {...handlers}
        role="button"
        tabIndex={0}
        aria-label={`Complete ${label}`}
        onKeyDown={(e) => {
          // Keyboard fallback — Enter/Space completes without needing a drag
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <ChevronsRightIcon />
      </div>
    </div>
  );
}

export default SwipeToComplete;