import CircularProgress from "./CircularProgress.jsx";
import "../styles/objectives.css";

const TargetIcon = () => (
  <svg className="obj-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="obj-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Parses as local midnight rather than UTC midnight — avoids the classic
// "new Date('2026-12-31')" off-by-one-day bug in timezones behind UTC.
function parseTargetDate(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTargetDate(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateStatus(date) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date - today) / 86400000);

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}D OVERDUE`, variant: "overdue" };
  if (diffDays === 0) return { label: "DUE TODAY", variant: "today" };
  return { label: `${diffDays}D REMAINING`, variant: "upcoming" };
}

function ObjectiveCard({ objective, missions, onDelete }) {
  const relatedMissions = missions.filter(
    (mission) => mission.objectiveId === objective.id
  );

  const completedMissions = relatedMissions.filter(
    (mission) => mission.completed
  ).length;

  const progress =
    relatedMissions.length === 0
      ? 0
      : Math.round((completedMissions / relatedMissions.length) * 100);

  const isComplete = relatedMissions.length > 0 && progress === 100;
  const targetDate = parseTargetDate(objective.targetDate);
  const dateStatus = getDateStatus(targetDate);

  const cardClass = [
    "objective-card-tactical",
    isComplete
      ? "objective-card-tactical--complete"
      : "objective-card-tactical--active",
  ].join(" ");

  return (
    <article className={cardClass}>
      <div className="obj-card-accent" />

      <div className="obj-card-header">
        <div className="obj-card-title-row">
          <TargetIcon />
          <h3 className="obj-card-title">{objective.title.toUpperCase()}</h3>
        </div>

        {isComplete ? (
          <span className="obj-status-pill obj-status-pill--complete">COMPLETE</span>
        ) : relatedMissions.length === 0 ? (
          <span className="obj-status-pill obj-status-pill--unassigned">NO MISSIONS LINKED</span>
        ) : dateStatus ? (
          <span className={`obj-status-pill obj-status-pill--${dateStatus.variant}`}>
            {dateStatus.label}
          </span>
        ) : (
          <span className="obj-status-pill obj-status-pill--unassigned">NO TARGET DATE</span>
        )}
      </div>

      <div className="obj-card-body">
        <CircularProgress value={progress} size={72} strokeWidth={6} theme="gold" />

        <div className="obj-card-stats">
          <div className="obj-stat">
            <span className="obj-stat-value">
              {completedMissions}/{relatedMissions.length}
            </span>
            <span className="obj-stat-label">MISSIONS COMPLETE</span>
          </div>

          <div className="obj-stat">
            <span className="obj-stat-value obj-stat-value--with-icon">
              <CalendarIcon />
              {formatTargetDate(targetDate) || "—"}
            </span>
            <span className="obj-stat-label">TARGET DATE</span>
          </div>
        </div>
      </div>

      <div className="obj-card-missions">
        <p className="obj-card-missions-title">LINKED MISSIONS</p>
        {relatedMissions.length === 0 ? (
          <p className="obj-card-empty">No missions assigned yet.</p>
        ) : (
          <ul className="obj-mission-list">
            {relatedMissions.map((mission) => (
              <li
                key={mission.id}
                className={`obj-mission-item ${
                  mission.completed ? "obj-mission-item--done" : ""
                }`}
              >
                <span className="obj-mission-dot" />
                {mission.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="obj-card-actions">
        <button
          className="obj-btn obj-btn--delete"
          onClick={() => onDelete(objective.id)}
          aria-label="Delete objective"
        >
          <DeleteIcon />
          DELETE
        </button>
      </div>
    </article>
  );
}

export default ObjectiveCard;