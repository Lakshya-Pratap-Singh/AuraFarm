import { useEffect, useState } from "react";
import { useXP } from "../context/XPContext.jsx";

function AnimatedCounter({ value, suffix = "", prefix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    let startTime;
    const duration = 650;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span className="widget-counter">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

function MetricCard({ title, value, suffix = "", prefix = "", detail }) {
  return (
    <article className="dashboard-widget-card dashboard-widget-card--metric">
      <div className="widget-card__header">
        <span className="widget-card__title">{title}</span>
        <span className="widget-card__signal" />
      </div>
      <div className="widget-card__value-wrap">
        <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
      </div>
      {detail && <p className="widget-card__detail">{detail}</p>}
    </article>
  );
}

function DashboardWidgets({
  completionRate,
  currentStreak,
  activeObjectives,
  topObjective,
  mostCompletedCategory,
  mostCommonCategory,
  highestPriorityMissionCount,
  mostCommonDifficulty,
  averageDifficulty,
  difficultyCounts,
  categoryCounts,
  weeklyData,
  recentActivity,
  totalMissions,
  completedMissions,
  activeMissions,
}) {
  const {
    level,
    totalXP,
    xpIntoLevel,
    xpNeededForNextLevel,
    progressPercent,
  } = useXP();

  const chartMax = Math.max(...weeklyData.map((day) => day.value), 1);

  return (
    <div className="dashboard-command-layout">
      <section className="dashboard-panel dashboard-panel--hero">
        <div>
          <p className="dashboard-panel__eyebrow">OPS STATUS</p>
          <h2 className="dashboard-panel__title">Mission Command Center</h2>
        </div>
        <div className="dashboard-panel__status-pill">
          <span className="dashboard-panel__status-dot" />
          ONLINE
        </div>
      </section>

      <section className="dashboard-metrics-grid">
        <MetricCard
          title="Mission Completion %"
          value={completionRate}
          suffix="%"
          detail={`${completedMissions}/${totalMissions} completed`}
        />
        <MetricCard
          title="Current Streak"
          value={currentStreak}
          suffix="d"
          detail="Consecutive days active"
        />
        <MetricCard
          title="Level"
          value={level}
          detail={`XP ${xpIntoLevel} / ${xpIntoLevel + xpNeededForNextLevel}`}
        />
        <MetricCard
          title="XP"
          value={totalXP}
          detail={`${xpNeededForNextLevel} to next level`}
        />
      </section>

      <section className="dashboard-panel dashboard-panel--overview">
        <div className="dashboard-panel__header">
          <p className="dashboard-panel__eyebrow">TACTICAL OVERVIEW</p>
          <span className="dashboard-panel__meta">{activeMissions} active ops</span>
        </div>

        <div className="dashboard-overview-card">
          <div>
            <p className="dashboard-overview-card__label">Operations</p>
            <h3>{completedMissions}</h3>
          </div>
          <div>
            <p className="dashboard-overview-card__label">Progress</p>
            <h3>{progressPercent}%</h3>
          </div>
          <div>
            <p className="dashboard-overview-card__label">Most Common Category</p>
            <h3>{mostCommonCategory}</h3>
          </div>
          <div>
            <p className="dashboard-overview-card__label">Highest Priority</p>
            <h3>{highestPriorityMissionCount}</h3>
          </div>
        </div>
      </section>

      <section className="dashboard-panel dashboard-panel--objectives">
        <div className="dashboard-panel__header">
          <p className="dashboard-panel__eyebrow">OBJECTIVE MATRIX</p>
        </div>
        <div className="dashboard-objective-grid">
          <article className="dashboard-widget-card dashboard-widget-card--objective">
            <span className="widget-card__title">Active Objectives</span>
            <AnimatedCounter value={activeObjectives} />
          </article>
          <article className="dashboard-widget-card dashboard-widget-card--objective">
            <span className="widget-card__title">Top Objective</span>
            <p className="dashboard-objective-card__name">
              {topObjective?.title || "No objectives yet"}
            </p>
            <div className="dashboard-objective-card__progress">
              <span>{topObjective?.computedProgress || 0}%</span>
            </div>
          </article>
          <article className="dashboard-widget-card dashboard-widget-card--objective">
            <span className="widget-card__title">Most Completed Category</span>
            <p className="dashboard-objective-card__name">{mostCompletedCategory}</p>
          </article>
        </div>
      </section>

      <section className="dashboard-panel dashboard-panel--analytics">
        <div className="dashboard-panel__header">
          <p className="dashboard-panel__eyebrow">ANALYTICS</p>
        </div>
        <div className="dashboard-analytics-grid">
          <article className="dashboard-widget-card dashboard-widget-card--analytics">
            <span className="widget-card__title">Difficulty Distribution</span>
            <p className="dashboard-analytics-card__value">{mostCommonDifficulty}</p>
            <p className="widget-card__detail">Avg difficulty: {averageDifficulty}/4</p>
          </article>
          <article className="dashboard-widget-card dashboard-widget-card--analytics">
            <span className="widget-card__title">Category Distribution</span>
            <p className="dashboard-analytics-card__value">{Object.keys(categoryCounts).length} groups</p>
            <p className="widget-card__detail">{Object.entries(categoryCounts).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
          </article>
          <article className="dashboard-widget-card dashboard-widget-card--analytics">
            <span className="widget-card__title">Difficulty Mix</span>
            <p className="dashboard-analytics-card__value">{Object.entries(difficultyCounts).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
          </article>
        </div>
      </section>

      <section className="dashboard-panel dashboard-panel--chart">
        <div className="dashboard-panel__header">
          <p className="dashboard-panel__eyebrow">WEEKLY COMPLETION</p>
          <span className="dashboard-panel__meta">Last 7 days</span>
        </div>
        <div className="dashboard-chart" role="img" aria-label="Weekly completion chart">
          {weeklyData.map((day, i) => (
            <div key={`${day.label}-${i}`} className="dashboard-chart__column">
              <div
                className="dashboard-chart__bar"
                style={{ height: `${(day.value / chartMax) * 100}%` }}
              />
              <span className="dashboard-chart__label">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-panel dashboard-panel--feed">
        <div className="dashboard-panel__header">
          <p className="dashboard-panel__eyebrow">RECENT ACTIVITY</p>
        </div>
        <div className="dashboard-feed">
          {recentActivity.length === 0 ? (
            <p className="widget-card__detail">No activity logged yet.</p>
          ) : (
            recentActivity.map((item) => (
              <article key={item.id} className="dashboard-feed__item">
                <div className={`dashboard-feed__dot dashboard-feed__dot--${item.type}`} />
                <div>
                  <p className="dashboard-feed__title">{item.title}</p>
                  <p className="dashboard-feed__meta">{item.detail}</p>
                </div>
                <span className="dashboard-feed__time">{item.time}</span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardWidgets;