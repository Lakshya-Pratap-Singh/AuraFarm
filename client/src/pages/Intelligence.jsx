// Intelligence — Analytics & Insights page
// Hosts the Tactical Activity Grid (90-day consistency heatmap) plus
// derived streak/average stat cards. All analytics math lives inside
// ActivityGrid; this page just renders the numbers it reports back.
//
// REWORKED: page chrome moved to the gold Batcomputer theme (matching
// missions.css/objectives.css) via the new intelligence.css — this page
// no longer borrows activity-grid.css's cyan tones for anything except
// the heatmap itself, which keeps its own native coloring on purpose
// (see intelligence.css header comment for why).
//
// Category/difficulty breakdown now renders as glowing gold donut
// charts (DonutChart) instead of the earlier bar-list BreakdownChart.
// Counts are computed here from real mission fields (mission.category,
// mission.difficulty) — unchanged from before.
//
// IMPORT ORDER MATTERS: ActivityGrid is imported before intelligence.css
// so activity-grid.css loads first and intelligence.css's overlapping
// selectors (.intel-page, .intel-stat-card, etc.) win the cascade.

import { useState } from "react";
import ActivityGrid from "../components/ActivityGrid.jsx";
import DonutChart from "../components/DonutChart.jsx";
import "../styles/intelligence.css";

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

// ── Reusable analytics card — single gold accent, "accent" flag only
// controls glow intensity (hierarchy through intensity, not hue) ────────
function IntelStatCard({ icon, label, value, accent }) {
  return (
    <div className={`intel-stat-card ${accent ? "intel-stat-card--accent" : ""}`}>
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

  // ── Category / difficulty distributions — real fields, no derivation ──
  const categoryCounts = missions.reduce((acc, mission) => {
    const category = mission.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const difficultyCounts = missions.reduce((acc, mission) => {
    const difficulty = mission.difficulty || "Normal";
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});

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
          accent
        />
        <IntelStatCard
          icon={<TrophyIcon />}
          label="BEST STREAK"
          value={`${analytics.bestStreak}D`}
        />
        <IntelStatCard
          icon={<TargetIcon />}
          label="AVG COMPLETION RATE"
          value={`${analytics.averageRate}%`}
        />
        <IntelStatCard
          icon={<CheckIcon />}
          label="TOTAL MISSIONS COMPLETED"
          value={totalCompleted}
        />
      </section>

      {/* ── Activity heatmap — kept in its native cyan tier coloring ──── */}
      <section className="intel-grid-section" aria-label="90 day activity grid">
        <ActivityGrid missions={missions} onAnalytics={setAnalytics} />
      </section>

      {/* ── Category / Difficulty breakdown — now donut charts ───────── */}
      <section className="intel-breakdown-row" aria-label="Category and difficulty breakdown">
        <DonutChart title="CATEGORY BREAKDOWN" data={categoryCounts} />
        <DonutChart title="DIFFICULTY BREAKDOWN" data={difficultyCounts} />
      </section>
    </div>
  );
}

export default Intelligence;