import { useEffect, useRef, useState } from "react";
import { notificationsApi } from "../api/notifications.js";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/notifications.css";

const POLL_INTERVAL_MS = 30000;

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
    </svg>
  );
}

function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ringing, setRinging] = useState(false);
  const wrapRef = useRef(null);
  const previousCount = useRef(0);

  const fetchUnreadCount = async () => {
    try {
      const { count } = await notificationsApi.unreadCount();
      if (count > previousCount.current) {
        setRinging(true);
        setTimeout(() => setRinging(false), 650);
      }
      previousCount.current = count;
      setUnreadCount(count);
    } catch {
      // Silent — a failed poll shouldn't disrupt the rest of the app.
    }
  };

  useEffect(() => {
    // Only poll once a user is signed in — avoids a stream of 401s on
    // the login screen.
    if (!user) return undefined;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`notif-bell ${ringing ? "notif-bell--ringing" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </div>
  );
}

export default NotificationBell;