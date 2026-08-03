import { useEffect, useRef, useState, useCallback } from "react";
import { notificationsApi } from "../api/notifications.js";
import NotificationCard from "./NotificationCard.jsx";

const FILTERS = [
  { label: "All", value: null },
  { label: "Missions", value: "MISSION" }, // client-side group, expanded below
  { label: "Achievements", value: "ACHIEVEMENT_UNLOCK" },
  { label: "Reports", value: "REPORT" }, // client-side group
  { label: "System", value: "SYSTEM" },
];

const MISSION_TYPES = new Set(["MISSION_REMINDER", "MISSION_DUE_SOON", "MISSION_COMPLETED", "STREAK_WARNING"]);
const REPORT_TYPES = new Set(["DAILY_RESET", "WEEKLY_REPORT", "OBJECTIVE_PROGRESS"]);

function matchesFilter(notification, filterValue) {
  if (!filterValue) return true;
  if (filterValue === "MISSION") return MISSION_TYPES.has(notification.type);
  if (filterValue === "REPORT") return REPORT_TYPES.has(notification.type);
  return notification.type === filterValue;
}

function NotificationDropdown({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const listRef = useRef(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.list({ limit: 20 });
      setNotifications(result.notifications);
      setCursor(result.nextCursor);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await notificationsApi.list({ limit: 20, cursor });
      setNotifications((prev) => [...prev, ...result.notifications]);
      setCursor(result.nextCursor);
    } catch (err) {
      setError(err.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || !cursor || loadingMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      loadMore();
    }
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    onUnreadCountChange?.((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Revert on failure so the UI doesn't lie about state.
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      onUnreadCountChange?.((c) => c + 1);
    }
  };

  const handleDelete = async (id) => {
    const removed = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (removed && !removed.isRead) onUnreadCountChange?.((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.remove(id);
    } catch {
      if (removed) setNotifications((prev) => [removed, ...prev]);
    }
  };

  const handleMarkAllRead = async () => {
    const hadUnread = notifications.some((n) => !n.isRead);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (hadUnread) onUnreadCountChange?.(() => 0);
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      loadFirstPage();
    }
  };

  const handleClearAll = async () => {
    const previous = notifications;
    setNotifications([]);
    onUnreadCountChange?.(() => 0);
    try {
      await notificationsApi.clearAll();
    } catch {
      setNotifications(previous);
    }
  };

  const visible = notifications.filter(
    (n) =>
      matchesFilter(n, filter) &&
      (search.trim() === "" ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase()))
  );

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <>
      <div className="notif-dropdown-backdrop" onClick={onClose} />
      <div className="notif-dropdown" role="dialog" aria-label="Notifications">
        <div className="notif-dropdown-header">
          <span className="notif-dropdown-title">Notifications</span>
          <div className="notif-dropdown-actions">
            <button
              type="button"
              className="notif-dropdown-action"
              onClick={handleMarkAllRead}
              disabled={!hasUnread}
            >
              Mark all read
            </button>
            <button
              type="button"
              className="notif-dropdown-action"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="notif-dropdown-filters">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className={`notif-filter-chip ${filter === f.value ? "notif-filter-chip--active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 14px 8px 14px" }}>
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "#0d0c15",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "8px",
              color: "#f1ecfb",
              padding: "7px 10px",
              fontSize: "12.5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="notif-dropdown-list" ref={listRef} onScroll={handleScroll}>
          {loading && <div className="notif-dropdown-empty">Loading...</div>}
          {!loading && error && <div className="notif-dropdown-empty">{error}</div>}
          {!loading && !error && visible.length === 0 && (
            <div className="notif-dropdown-empty">No notifications here yet.</div>
          )}
          {!loading &&
            !error &&
            visible.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          {cursor && !loading && (
            <button type="button" className="notif-dropdown-loadmore" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationDropdown;