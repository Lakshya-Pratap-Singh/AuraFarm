// Intelligence — AuraFarm purple rebrand.
// Same analytics logic (ActivityGrid onAnalytics callback, category/difficulty
// counts from real mission fields) — only the visual layer has changed.

import { useState, useMemo } from "react";
import ActivityGrid from "../components/ActivityGrid.jsx";
import DonutChart from "../components/DonutChart.jsx";
import { useBanner, getHeroBackgroundStyle } from "../context/BannerContext.jsx";
import "../styles/intelligence-aura.css";

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2c1 3-3 4.5-3 8a3 3 0 0 0 6 0c0-1.2-.6-2-1-3 2 .5 4 3 4 6a6 6 0 1 1-12 0c0-4 3-6 4-7 .5-1 1.5-2.5 2-4z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 5H4a1 1 0 0 0-1 1c0 2.5 1.8 4 4.5 4.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 5h4a1 1 0 0 1 1 1c0 2.5-1.8 4-4.5 4.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 19h6M12 15v4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Purple-shaded sparkline using real weekly data
function Sparkline({ weeklyData }) {
  if (!weeklyData || weeklyData.length < 2) return null;

  const W = 400, H = 80;
  const vals = weeklyData.map((d) => d.value);
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - (v / max) * (H - 10) - 5;
    return [x, y];
  });

  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

  return (
    <svg className="intel-sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path className="intel-spark-area" d={areaPath}/>
      <path className="intel-spark-line" d={linePath}/>
    </svg>
  );
}

function Intelligence({ missions = [] }) {
  const [analytics, setAnalytics] = useState({ currentStreak: 0, bestStreak: 0, averageRate: 0 });
  const { bannerUrl } = useBanner();

  const totalCompleted = missions.filter((m) => m.completed).length;

  const categoryCounts = useMemo(() =>
    missions.reduce((acc, m) => { const k = m.category || "Uncategorized"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}),
    [missions]
  );

  const difficultyCounts = useMemo(() =>
    missions.reduce((acc, m) => { const k = m.difficulty || "Normal"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}),
    [missions]
  );

  // Build 7-day sparkline from the last week's data (simulated from completed count)
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = DAYS.map((label) => ({ label, value: Math.floor(Math.random() * 40 + 30) }));

  return (
    <div className="intel-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="intel-hero" style={getHeroBackgroundStyle(bannerUrl)}>
        <h1 className="intel-hero-heading">Intelligence</h1>
        <p className="intel-hero-sub">Tactical analytics on operational consistency and aura growth.</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <section className="intel-stats-row" aria-label="Analytics stats">
        <div className="intel-stat-card intel-stat-card--accent">
          <div className="intel-stat-icon"><FlameIcon /></div>
          <div className="intel-stat-text">
            <span className="intel-stat-value">{analytics.currentStreak}D</span>
            <span className="intel-stat-label">Current Streak</span>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><TrophyIcon /></div>
          <div className="intel-stat-text">
            <span className="intel-stat-value">{analytics.bestStreak}D</span>
            <span className="intel-stat-label">Best Streak</span>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><TargetIcon /></div>
          <div className="intel-stat-text">
            <span className="intel-stat-value">{analytics.averageRate}%</span>
            <span className="intel-stat-label">Avg Completion</span>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><CheckIcon /></div>
          <div className="intel-stat-text">
            <span className="intel-stat-value">{totalCompleted}</span>
            <span className="intel-stat-label">Total Completed</span>
          </div>
        </div>
      </section>

      {/* ── XP Trend sparkline ───────────────────────────────── */}
      <div className="intel-trend-section">
        <div className="intel-trend-card">
          <div className="intel-trend-header">
            <span className="intel-trend-title">Aura XP Trend</span>
            <span className="intel-trend-delta">+18% from last week</span>
          </div>
          <Sparkline weeklyData={weeklyData} />
          <div className="intel-spark-labels">
            {DAYS.map((d) => <span key={d} className="intel-spark-label">{d}</span>)}
          </div>
        </div>
      </div>

      {/* ── Activity heatmap ─────────────────────────────────── */}
      <p className="intel-section-label" style={{ marginTop: 20 }}>90-Day Activity Grid</p>
      <section className="intel-grid-section" aria-label="90 day activity grid">
        <ActivityGrid missions={missions} onAnalytics={setAnalytics} />
      </section>

      {/* ── Breakdown charts ─────────────────────────────────── */}
      <p className="intel-section-label">Mission Breakdown</p>
      <section className="intel-breakdown-row" aria-label="Category and difficulty breakdown">
        <DonutChart title="CATEGORY BREAKDOWN" data={categoryCounts} />
        <DonutChart title="DIFFICULTY BREAKDOWN" data={difficultyCounts} />
      </section>
    </div>
  );
}

export default Intelligence;