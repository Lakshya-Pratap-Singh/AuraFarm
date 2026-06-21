// Intelligence — Analytics & Insights page
// Hosts the Tactical Activity Grid (90-day consistency heatmap) plus
// derived streak/average stat cards. All analytics math lives inside
// ActivityGrid; this page just renders the numbers it reports back.

import { useState } from "react";
import ActivityGrid from "../components/ActivityGrid.jsx";
import "../styles/activity-grid.css";

// ── Small inline icons (kept local — single-use on this page) ───────────
const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2c1 3-3 4.5-3 8a3 3 0 0 0 6 0c0-1.2-.6-2-1-3 2 .5 4 3 4 6a6 6 0 1 1-12 0c0-4 3-6 4-7 .5-1 1.5-2.5 2-4z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 5H4a1 1 0 0 0-1 1c0 2.5 1.8 4 4.5 4.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 5h4a1 1 0 0 1 1 1c0 2.5-1.8 4-4.5 4.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 19h6M12 15v4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Reusable analytics card ───────────────────────────────────────────────
function IntelStatCard({ icon, label, value, tone }) {
  return (
    <div className={`intel-stat-card intel-stat-card--${tone}`}>
      <div className="intel-stat-icon">{icon}</div>
      <div className="intel-stat-text">
        <span className="intel-stat-value">{value}</span>
        <span className="intel-stat-label">{label}</span>
      </div>
    </div>
  );
}

function Intelligence({ missions = [] }) {
  const [analytics, setAnalytics] = useState({
    currentStreak: 0,
    bestStreak: 0,
    averageRate: 0,
  });

  const totalCompleted = missions.filter((m) => m.completed).length;

  return (
    <div className="intel-page">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="intel-header">
        <div className="intel-header-title">
          <span className="intel-header-eyebrow">DAILYWISE // SURVEILLANCE OPS</span>
          <h1 className="intel-heading">INTELLIGENCE</h1>
        </div>
        <p className="intel-header-desc">
          Tactical analytics on operational consistency and mission throughput.
        </p>
      </header>

      {/* ── Analytics cards ──────────────────────────────────────────── */}
      <section className="intel-stats-row" aria-label="Activity analytics">
        <IntelStatCard
          icon={<FlameIcon />}
          label="CURRENT STREAK"
          value={`${analytics.currentStreak}D`}
          tone="cyan"
        />
        <IntelStatCard
          icon={<TrophyIcon />}
          label="BEST STREAK"
          value={`${analytics.bestStreak}D`}
          tone="green"
        />
        <IntelStatCard
          icon={<TargetIcon />}
          label="AVG COMPLETION RATE"
          value={`${analytics.averageRate}%`}
          tone="yellow"
        />
        <IntelStatCard
          icon={<CheckIcon />}
          label="TOTAL MISSIONS COMPLETED"
          value={totalCompleted}
          tone="purple"
        />
      </section>

      {/* ── Activity heatmap ─────────────────────────────────────────── */}
      <section className="intel-grid-section" aria-label="90 day activity grid">
        <ActivityGrid missions={missions} onAnalytics={setAnalytics} />
      </section>
    </div>
  );
}

export default Intelligence;