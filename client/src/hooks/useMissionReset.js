// useMissionReset — midnight recurrence engine.
//
// Runs on mount and every minute. For each mission with a recurrence
// schedule, checks if it should be reset (completed → false) based on
// the lastResetDate stored on the mission.
//
// Recurrence types:
//   "none"    — one-off, never resets (default)
//   "daily"   — resets every day after 00:00
//   "weekly"  — resets on the same day each week
//   "monthly" — resets on the same day each month
//   "custom"  — resets every N days (mission.recurrenceDays)
//
// A mission is reset when today's date-string > lastResetDate.
// On first run, lastResetDate is set to today so brand-new recurring
// missions don't immediately un-complete themselves.

import { useEffect } from "react";

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function shouldReset(mission) {
  const { recurrence, recurrenceDays, lastResetDate } = mission;
  if (!recurrence || recurrence === "none") return false;
  if (!lastResetDate) return false; // safety: initialised by addMission

  const last  = new Date(lastResetDate);
  const now   = new Date();
  // Normalise to midnight local
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - last) / 86400000);

  if (diffDays <= 0) return false; // same calendar day

  if (recurrence === "daily")   return diffDays >= 1;
  if (recurrence === "weekly")  return diffDays >= 7;
  if (recurrence === "monthly") return diffDays >= 30;
  if (recurrence === "custom")  return diffDays >= (recurrenceDays || 1);
  return false;
}

export function buildNewMission({
  title,
  priority      = "Medium",
  difficulty    = "Normal",
  category      = "Learning",
  objectiveId   = null,
  recurrence    = "none",
  recurrenceDays = 1,
}) {
  return {
    id:             Date.now(),
    title:          title.trim(),
    completed:      false,
    objectiveId,
    priority,
    difficulty,
    category,
    recurrence,
    recurrenceDays: recurrence === "custom" ? Number(recurrenceDays) : 1,
    lastResetDate:  todayStr(),   // so it won't reset until tomorrow
    createdAt:      new Date().toISOString(),
  };
}

export function useMissionReset(missions, setMissions) {
  useEffect(() => {
    function runReset() {
      const today = todayStr();
      setMissions(prev => {
        let changed = false;
        const next = prev.map(m => {
          if (!m.completed) return m;         // nothing to reset
          if (!shouldReset(m)) return m;
          changed = true;
          return { ...m, completed: false, lastResetDate: today };
        });
        return changed ? next : prev;
      });
    }

    runReset(); // on mount
    const id = setInterval(runReset, 60_000); // every minute
    return () => clearInterval(id);
  }, [setMissions]);
}