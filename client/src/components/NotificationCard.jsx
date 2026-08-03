// NotificationCard.jsx — single row inside the dropdown / preferences history.

const TYPE_ICON = {
  MISSION_REMINDER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  MISSION_DUE_SOON: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 3.9 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
    </svg>
  ),
  MISSION_COMPLETED: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ACHIEVEMENT_UNLOCK: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12l4 6-10 12L2 9Z" strokeLinejoin="round" />
    </svg>
  ),
  OBJECTIVE_PROGRESS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  STREAK_WARNING: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2s6 5.5 6 11a6 6 0 0 1-12 0c0-2 1-3.5 2-4.5.2 1.5 1 2 1 2C8.5 7 12 5 12 2Z" strokeLinejoin="round" />
    </svg>
  ),
  DAILY_RESET: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12a9 9 0 1 1-3-6.7" strokeLinecap="round" />
      <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  WEEKLY_REPORT: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14l3-4 3 3 4-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  SYSTEM: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  ),
};

function ReadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function NotificationCard({ notification, onMarkRead, onDelete }) {
  const { id, title, message, type, priority, isRead, createdAt } = notification;

  return (
    <div
      className={`notif-card ${isRead ? "" : "notif-card--unread"} ${
        priority === "HIGH" ? "notif-card--priority-high" : ""
      }`}
    >
      <div className="notif-card-icon">{TYPE_ICON[type] || TYPE_ICON.SYSTEM}</div>
      <div className="notif-card-body">
        <p className="notif-card-title">{title}</p>
        <p className="notif-card-message">{message}</p>
        <div className="notif-card-meta">
          <span>{timeAgo(createdAt)}</span>
        </div>
      </div>
      <div className="notif-card-actions">
        {!isRead && (
          <button
            type="button"
            className="notif-card-action-btn"
            title="Mark as read"
            onClick={() => onMarkRead?.(id)}
          >
            <ReadIcon />
          </button>
        )}
        <button
          type="button"
          className="notif-card-action-btn notif-card-action-btn--danger"
          title="Delete"
          onClick={() => onDelete?.(id)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default NotificationCard;