// XPContext — XP & Level state architecture for DailyWise.
//
// This is the missing piece main.jsx was already wired up to expect
// (<XPProvider> was referenced there with no implementation).
//
// Responsible for:
//   - Holding total XP, persisted to localStorage
//   - Deriving level / progress from that single source of truth
//   - Exposing gainXP(amount) for mission completion (and reopening,
//     via a negative amount) to call into
//   - Tracking the most recent XP event so the widget can animate it

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const XP_STORAGE_KEY = "dailywise_xp";
const XP_LOG_KEY = "dailywise_xp_log";
const XP_PER_LEVEL = 250;

// Mission XP table — single source of truth per the spec.
// Imported by Missions.jsx so completion awards stay in sync with this.
export const MISSION_XP_TABLE = {
  Easy: 10,
  Normal: 25,
  Hard: 50,
  Legendary: 100,
};

// ── Derived stat helpers (pure functions — easy to test/reuse) ──────────
// Level starts at 1 with 0 XP rather than 0, which reads better for a
// "User Level" display than starting at Level 0.
function getLevel(totalXP) {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

function getXPIntoLevel(totalXP) {
  return totalXP % XP_PER_LEVEL;
}

function getXPNeededForNextLevel(totalXP) {
  return XP_PER_LEVEL - getXPIntoLevel(totalXP);
}

function getProgressPercent(totalXP) {
  return Math.round((getXPIntoLevel(totalXP) / XP_PER_LEVEL) * 100);
}

// ── localStorage access ──────────────────────────────────────────────────
function loadStoredXP() {
  try {
    const raw = localStorage.getItem(XP_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed.totalXP === "number" && parsed.totalXP >= 0
      ? parsed.totalXP
      : 0;
  } catch {
    return 0;
  }
}

function saveStoredXP(totalXP) {
  try {
    localStorage.setItem(XP_STORAGE_KEY, JSON.stringify({ totalXP }));
  } catch {
    // localStorage unavailable — XP just won't persist this session
  }
}

// Local-time date key (not UTC — avoids a day-shift around midnight),
// same convention ActivityGrid.jsx uses for its own daily log.
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Per-day XP-earned log — powers the Dashboard's Weekly Progress chart
// and its "% change from yesterday" figure. Keyed by local date, value
// is the net XP gained that day (mission reopen/undo nets it back down).
function loadXPLog() {
  try {
    const raw = localStorage.getItem(XP_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveXPLog(log) {
  try {
    localStorage.setItem(XP_LOG_KEY, JSON.stringify(log));
  } catch {
    // localStorage unavailable — today's log entry just won't persist
  }
}

const XPContext = createContext(null);

export function XPProvider({ children }) {
  const [totalXP, setTotalXP] = useState(loadStoredXP);
  const [xpLog, setXpLog] = useState(loadXPLog);

  // Most recent gain/loss event — consumed by XPWidget to trigger the
  // animated "+25 XP" / "-25 XP" popup. `key` changes on every call so
  // effects depending on it fire even if the same amount repeats.
  const [lastGain, setLastGain] = useState(null);

  useEffect(() => {
    saveStoredXP(totalXP);
  }, [totalXP]);

  // amount can be negative — used when a mission is reopened, to
  // symmetrically revoke the XP it previously granted.
  const gainXP = useCallback((amount) => {
    if (!amount) return;
    setTotalXP((prev) => Math.max(0, prev + amount));
    setLastGain({ amount, key: Date.now() + Math.random() });
    setXpLog((prev) => {
      const todayKey = formatDateKey(new Date());
      const next = { ...prev, [todayKey]: Math.max(0, (prev[todayKey] || 0) + amount) };
      saveXPLog(next);
      return next;
    });
  }, []);

  const value = {
    totalXP,
    level: getLevel(totalXP),
    xpIntoLevel: getXPIntoLevel(totalXP),
    xpNeededForNextLevel: getXPNeededForNextLevel(totalXP),
    progressPercent: getProgressPercent(totalXP),
    xpPerLevel: XP_PER_LEVEL,
    gainXP,
    lastGain,
    xpLog,
  };

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) {
    throw new Error("useXP must be used within an XPProvider");
  }
  return ctx;
}