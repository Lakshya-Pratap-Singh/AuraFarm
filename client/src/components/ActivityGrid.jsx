// ActivityGrid — Tactical 90-day consistency heatmap (GitHub-contributions style)
//
// Mission objects don't carry a completion date, so there's no historical
// per-day record to draw from. To make a real heatmap possible without
// touching Mission/Objective CRUD, this component takes a daily snapshot:
// every time it mounts (or `missions` changes), it records *today's*
// completion rate into a localStorage log. Days before the feature was
// first used simply render as empty (0%) cells — history builds up
// naturally from here on.
//
// Props:
//   missions     — current missions array (read-only, never mutated)
//   onAnalytics  — optional callback({ currentStreak, bestStreak, averageRate })
//                  fired whenever the grid recomputes, so parent pages
//                  (e.g. Intelligence.jsx) can render stat cards without
//                  duplicating the localStorage/calculation logic.

import { useEffect, useState } from "react";
import "../styles/activity-grid.css";

const ACTIVITY_LOG_KEY = "dailywise_activity_log";
const DAYS_IN_WINDOW = 90;

// ── Date helpers (local time, not UTC — avoids toISOString day-shift bugs) ──
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── localStorage log access ──────────────────────────────────────────────
function loadActivityLog() {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveActivityLog(log) {
  try {
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently,
    // grid just won't persist this session
  }
}

// Records today's completion snapshot from live mission data.
// Never reads/writes anything related to Mission CRUD itself.
function recordSnapshot(missions) {
  const log = loadActivityLog();
  const todayKey = formatDateKey(startOfToday());

  const total = missions.length;
  const completed = missions.filter((m) => m.completed).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  log[todayKey] = { total, completed, rate };
  saveActivityLog(log);
  return log;
}

// ── Tier bucketing per the spec ──────────────────────────────────────────
// 0%: dark · 1-25%: blue · 26-50%: yellow · 51-75%: orange · 76-100%: green
function getTier(rate) {
  if (rate <= 0) return 0;
  if (rate <= 25) return 1;
  if (rate <= 50) return 2;
  if (rate <= 75) return 3;
  return 4;
}

function getLast90Days(log) {
  const days = [];
  const today = startOfToday();

  for (let i = DAYS_IN_WINDOW - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d);
    const entry = log[dateKey];

    const total = entry?.total ?? 0;
    const completed = entry?.completed ?? 0;
    const rate = entry?.rate ?? 0;

    days.push({ date: d, dateKey, total, completed, rate, tier: getTier(rate) });
  }

  return days;
}

// ── Analytics derived from the 90-day window ─────────────────────────────
function computeStreaks(days) {
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].rate > 0) current++;
    else break;
  }

  let best = 0;
  let run = 0;
  for (const day of days) {
    if (day.rate > 0) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  return { current, best };
}

function computeAverageRate(days) {
  const tracked = days.filter((d) => d.total > 0);
  if (tracked.length === 0) return 0;
  const sum = tracked.reduce((acc, d) => acc + d.rate, 0);
  return Math.round(sum / tracked.length);
}

// ── Grid layout helpers — weeks as columns, Sun→Sat as rows ──────────────
function buildWeeks(days) {
  if (days.length === 0) return [];
  const leadingPad = days[0].date.getDay(); // 0 (Sun) – 6 (Sat)
  const padded = Array(leadingPad).fill(null).concat(days);

  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

function getMonthLabels(weeks) {
  let lastMonth = null;
  return weeks.map((week) => {
    const firstDay = week.find((d) => d !== null);
    if (!firstDay) return "";
    const month = firstDay.date.getMonth();
    if (month === lastMonth) return "";
    lastMonth = month;
    return firstDay.date.toLocaleDateString("en-US", { month: "short" });
  });
}

const WEEKDAY_ROW_LABELS = ["", "MON", "", "WED", "", "FRI", ""];

function PulseIcon() {
  return (
    <svg className="ag-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12h4l2 7 4-14 2 7h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActivityGrid({ missions = [], onAnalytics }) {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const log = recordSnapshot(missions);
    const computedDays = getLast90Days(log);
    setDays(computedDays);

    const { current, best } = computeStreaks(computedDays);
    const averageRate = computeAverageRate(computedDays);
    onAnalytics?.({ currentStreak: current, bestStreak: best, averageRate });
    // missions is the only thing that should re-trigger a snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions]);

  const weeks = buildWeeks(days);
  const monthLabels = getMonthLabels(weeks);

  return (
    <div className="activity-grid-card">
      <div className="ag-header">
        <span className="ag-title">
          <PulseIcon />
          TACTICAL ACTIVITY GRID
        </span>
        <span className="ag-badge">
          <span className="ag-badge-dot" />
          TRACKING ACTIVE
        </span>
      </div>

      <p className="ag-subtitle">LAST {DAYS_IN_WINDOW} DAYS // DAILY CONSISTENCY LOG</p>

      <div className="ag-scroll">
        <div className="ag-grid-body">
          {/* Weekday row labels */}
          <div className="ag-weekday-col">
            {WEEKDAY_ROW_LABELS.map((label, i) => (
              <span className="ag-weekday-label" key={i}>{label}</span>
            ))}
          </div>

          <div className="ag-weeks-wrap">
            {/* Month labels */}
            <div className="ag-months-row">
              {monthLabels.map((label, i) => (
                <span className="ag-month-label" key={i}>{label}</span>
              ))}
            </div>

            {/* Heatmap cells */}
            <div className="ag-weeks">
              {weeks.map((week, wi) => (
                <div className="ag-week-col" key={wi}>
                  {week.map((day, di) =>
                    day ? (
                      <div
                        key={day.dateKey}
                        className={`ag-cell ag-tier-${day.tier}`}
                        data-tooltip={`${day.dateKey} · ${day.rate}% (${day.completed}/${day.total})`}
                      />
                    ) : (
                      <div className="ag-cell ag-cell--empty" key={`pad-${wi}-${di}`} />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ag-legend">
        <span className="ag-legend-label">LESS</span>
        <span className="ag-cell ag-tier-0" />
        <span className="ag-cell ag-tier-1" />
        <span className="ag-cell ag-tier-2" />
        <span className="ag-cell ag-tier-3" />
        <span className="ag-cell ag-tier-4" />
        <span className="ag-legend-label">MORE</span>
      </div>
    </div>
  );
}

export {
  recordSnapshot,
  getLast90Days,
  computeStreaks,
};

export default ActivityGrid;