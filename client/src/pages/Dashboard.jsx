import { useState, useMemo, useEffect } from "react";
import { useXP } from "../context/XPContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useBanner, getHeroBackgroundStyle } from "../context/BannerContext.jsx";
import { computeStreaks, getLast90Days, recordSnapshot } from "../components/ActivityGrid.jsx";
import { RELIC_CATALOG, useRelicUnlockState } from "./Relics.jsx";
import { getRelicImage } from "../data/relicAssets.js";
import useSwipeGesture from "../hooks/useSwipeGesture.js";
import CategoryBadge from "../components/common/CategoryBadge.jsx";
import StreakLogo from "../components/common/StreakLogo.jsx";
import GlowTrace from "../components/GlowTrace.jsx";
import "../styles/dashboard.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const GemIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M6 3h12l4 6-10 12L2 9Z" />
    <path d="M2 9h20" />
    <path d="M9 3 8 9l4 12 4-12-1-6" />
  </svg>
);

// ── Circular ring SVG helper (used for both stat-ring and aura-overview) ──
function Ring({ size = 58, strokeWidth = 4, pct = 0, color = "#a855f7", className = "" }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 1));
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <linearGradient id="aura-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 ${strokeWidth + 2}px rgba(168,85,247,0.7))`, transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}


// ── Dashboard Mission Row — swipe-fill gesture, no card slide ────────────
function DashMissionRow({ mission, onComplete, onNavigate }) {
  const { trackRef, fillPct, leftPct, isDragging, direction, handlers } = useSwipeGesture({
    bidirectional: true,
    onComplete: mission.completed ? undefined : () => onComplete(mission.id),
    onEdit: mission.completed ? () => onComplete(mission.id) : () => onNavigate?.("Missions"),
  });

  const swipeStage = fillPct >= 0.85 ? "ready" : fillPct >= 0.4 ? "progress" : "idle";
  const isRightDrag = isDragging && direction === "right";
  const isLeftDrag = isDragging && direction === "left";
  const done = mission.completed;

  return (
    <div
      ref={trackRef}
      className={`db-mission-row ${!done ? "db-mission-row--active" : ""} ${isDragging ? "db-mission-row--dragging" : ""}`}
      {...handlers}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Swipe fill overlay */}
      {isRightDrag && fillPct > 0 && (
        <div
          className={`db-swipe-fill db-swipe-fill--${swipeStage}`}
          style={{ width: `${fillPct * 100}%` }}
          aria-hidden="true"
        >
          {fillPct > 0.35 && (
            <span className="db-swipe-fill-label">
              {swipeStage === "ready" ? "✓" : `${Math.round(fillPct * 100)}%`}
            </span>
          )}
        </div>
      )}
      {isLeftDrag && leftPct > 0 && (
        <div className="db-swipe-edit-reveal" aria-hidden="true" style={{ opacity: Math.min(leftPct * 2, 1) }}>
          <span>{mission.completed ? "REOPEN" : "EDIT"}</span>
        </div>
      )}

      <span className="db-mission-category">
        <CategoryBadge category={mission.category || "others"} size="lg" showLabel={false} />
      </span>
      <div className="db-mission-info">
        <div className="db-mission-title">{mission.title}</div>
        <div className="db-mission-sub"><CategoryBadge category={mission.category || "others"} size="xs" showIcon={false} /></div>
      </div>
      {isLeftDrag && leftPct > 0 ? (
        <span className="db-mission-arrow-hint" aria-hidden="true">←</span>
      ) : done ? (
        <span className="db-mission-status db-mission-status--done">
          Completed <CheckCircle />
        </span>
      ) : (
        <span className="db-mission-arrow-hint" aria-hidden="true">→</span>
      )}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ missions = [], objectives = [], setMissions, onNavigate }) {
  const { totalXP, xpIntoLevel, xpNeededForNextLevel, xpLog } = useXP();
  const { user } = useAuth();
  const { bannerUrl } = useBanner();

  // Keep the shared 90-day activity log fresh from this page too (not
  // only when visiting Intelligence), so the streak/relic tiles below
  // have real data as soon as something's been completed today.
  useEffect(() => {
    recordSnapshot(missions);
  }, [missions]);

  // Current + longest streak, both read from the one real activity log
  // (this used to read a "daily-snapshots" key nothing ever wrote to,
  // so the streak tile always showed 0).
  const { currentStreak, longestStreak } = useMemo(() => {
    try {
      const raw = localStorage.getItem("dailywise_activity_log");
      const log = raw ? JSON.parse(raw) : {};
      const days = getLast90Days(log);
      const { current, best } = computeStreaks(days);
      return { currentStreak: current, longestStreak: best };
    } catch {
      return { currentStreak: 0, longestStreak: 0 };
    }
  }, [missions]);

  // Daily progress: completed missions / total missions
  const completedToday = missions.filter((m) => m.completed).length;
  const totalToday = missions.length;
  const dailyPct = totalToday > 0 ? completedToday / totalToday : 0;

  // Objectives achieved
  const objectivesAchieved = objectives.filter((o) => o.completed).length;

  // Relics collected — same catalog + unlock engine the Relics page uses
  const relicUnlockState = useRelicUnlockState();
  const unlockedRelics = useMemo(
    () => RELIC_CATALOG.filter((relic) => relicUnlockState[relic.id]?.unlocked),
    [relicUnlockState]
  );
  const totalRelicsCollected = unlockedRelics.length;
  const totalRelicsInCatalog = RELIC_CATALOG.length;
  // The app doesn't persist real unlock timestamps yet, so the most
  // "advanced" unlocked relic (catalog runs common → mythic) stands in
  // as the recent-achievement highlight.
  const recentAchievement = unlockedRelics[unlockedRelics.length - 1] || null;

  // XP bar
  const xpPct = xpNeededForNextLevel > 0 ? xpIntoLevel / xpNeededForNextLevel : 0;
  const xpToNext = xpNeededForNextLevel - xpIntoLevel;

  // Weekly XP — last 7 days from the daily XP log, oldest first
  const weeklyXP = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3),
        xp: xpLog?.[key] || 0,
      });
    }
    return out;
  }, [xpLog]);

  const todayXP = weeklyXP[weeklyXP.length - 1]?.xp || 0;
  const yesterdayXP = weeklyXP[weeklyXP.length - 2]?.xp || 0;
  const xpChangePct = yesterdayXP > 0
    ? Math.round(((todayXP - yesterdayXP) / yesterdayXP) * 100)
    : (todayXP > 0 ? 100 : 0);
  const maxWeeklyXP = Math.max(...weeklyXP.map((d) => d.xp), 1);

  // Today's missions — show first 4
  const displayMissions = missions.slice(0, 4);

  const handleCompleteMission = (id) => {
    if (!setMissions) return;
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    );
  };

  return (
    <div className="db-page">
      {/* Top bar */}
      <div className="db-topbar">
        <div className="db-topbar-xp">
          <span className="db-topbar-xp-icon"><GemIcon /></span>
          {totalXP.toLocaleString()}
        </div>
        <button className="db-topbar-bell" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="db-topbar-bell-dot" />
        </button>
      </div>

      {/* Hero banner */}
      <section className="db-hero" aria-label="Hero" style={getHeroBackgroundStyle(bannerUrl)}>
        <div className="db-hero-content">
          <h1 className="db-hero-title">Become What<br />You Dreamt For.</h1>
          <p className="db-hero-sub">
            Every mission completed today builds<br />
            the person you want to become tomorrow.
          </p>
        </div>
      </section>

      {/* 5 Stat cards */}
      <section className="db-stats" aria-label="Stats">
        {/* Daily Streak */}
        <div className="db-stat-card glow">
          <div className="db-stat-label">Daily Streak</div>
          <div className="db-stat-streak-row">
            <StreakLogo className="db-stat-streak-logo" size={32} />
            <span className="db-stat-value">{currentStreak} Days</span>
          </div>
          <div className="db-stat-sub">Keep it burning!</div>
          <GlowTrace />
        </div>

        {/* Progress % (completed / total missions today) */}
        <div className="db-stat-card glow">
          <div className="db-stat-label">Progress</div>
          <div className="db-stat-ring-row">
            <div>
              <div className="db-stat-value" style={{ fontSize: 26 }}>
                {Math.round(dailyPct * 100)}%
              </div>
              <div className="db-stat-sub">{completedToday} / {totalToday} missions</div>
            </div>
            <div className="db-stat-ring-wrap">
              <Ring size={58} strokeWidth={4} pct={dailyPct} color="#a855f7" />
              <div className="db-stat-ring-label">{Math.round(dailyPct * 100)}%</div>
            </div>
          </div>
          <GlowTrace />
        </div>

        {/* Total Relics Collected */}
        <div className="db-stat-card glow">
          <div className="db-stat-label">Relics Collected</div>
          <div className="db-stat-level-row">
            <div>
              <div className="db-stat-value">{totalRelicsCollected}<span className="db-stat-value-of">/{totalRelicsInCatalog}</span></div>
              <div className="db-stat-sub">Keep hunting</div>
            </div>
            <span className="db-stat-icon-badge"><GemIcon /></span>
          </div>
          <GlowTrace />
        </div>

        {/* Objectives Achieved */}
        <div className="db-stat-card glow">
          <div className="db-stat-label">Objectives Achieved</div>
          <div className="db-stat-level-row">
            <div>
              <div className="db-stat-value">{objectivesAchieved}<span className="db-stat-value-of">/{objectives.length}</span></div>
              <div className="db-stat-sub">Long-term goals</div>
            </div>
            <span className="db-stat-icon-badge"><CheckCircle /></span>
          </div>
          <GlowTrace />
        </div>

        {/* Recent Achievement (compact) */}
        <div className="db-stat-card db-stat-card--achievement glow">
          <div className="db-stat-label">Recent Achievement</div>
          {recentAchievement ? (
            <div className="db-stat-achievement-row">
              <img
                src={getRelicImage(recentAchievement.id)}
                alt={recentAchievement.name}
                className="db-stat-achievement-icon"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div>
                <div className="db-stat-achievement-name">{recentAchievement.name}</div>
                <div className="db-stat-sub">{recentAchievement.rarity}</div>
              </div>
            </div>
          ) : (
            <div className="db-stat-sub">No relics unlocked yet</div>
          )}
          <GlowTrace />
        </div>
      </section>

      {/* Bottom 3 columns */}
      <section className="db-bottom" aria-label="Dashboard panels">

        {/* TODAY'S MISSIONS */}
        <div className="db-panel glow">
          <div className="db-panel-title">Today's Missions</div>
          <div className="db-mission-list">
            {displayMissions.length === 0 && (
              <p style={{ color: "#8b7faa", fontSize: 12, textAlign: "center", padding: "16px 0" }}>
                No missions yet. Add some in Missions.
              </p>
            )}
            {displayMissions.map((m) => (
              <DashMissionRow
                key={m.id}
                mission={m}
                onComplete={handleCompleteMission}
                onNavigate={onNavigate}
              />
            ))}
          </div>
          <button
            className="db-view-all"
            onClick={() => onNavigate?.("Missions")}
          >
            View All Missions <ArrowRight />
          </button>
          <GlowTrace />
        </div>

        {/* AURA OVERVIEW */}
        <div className="db-panel glow db-aura-overview">
          <div className="db-panel-title">Aura Overview</div>

          <div className="db-aura-xp-block">
            <div className="db-aura-xp-label">Level Progress</div>
            <div className="db-aura-xp-value">
              {xpIntoLevel.toLocaleString()}
              <span className="db-aura-xp-value-of"> / {xpNeededForNextLevel.toLocaleString()}</span>
            </div>
            <div className="db-xp-bar-wrap">
              <div className="db-xp-bar" style={{ width: `${xpPct * 100}%` }} />
            </div>
            <div className="db-stat-sub">+{xpToNext.toLocaleString()} XP to next level</div>
          </div>

          <div className="db-aura-subtiles">
            <div className="db-aura-subtile">
              <span className="db-aura-subtile-value">{longestStreak}</span>
              <span className="db-aura-subtile-label">Longest Streak</span>
            </div>
            <div className="db-aura-subtile">
              <span className="db-aura-subtile-value">{totalXP.toLocaleString()}</span>
              <span className="db-aura-subtile-label">Total XP</span>
            </div>
            <div className="db-aura-subtile">
              <span className={`db-aura-subtile-value ${xpChangePct >= 0 ? "db-aura-subtile-value--up" : "db-aura-subtile-value--down"}`}>
                {xpChangePct >= 0 ? "+" : ""}{xpChangePct}%
              </span>
              <span className="db-aura-subtile-label">Vs Yesterday</span>
            </div>
          </div>
          <GlowTrace />
        </div>

        {/* WEEKLY PROGRESS */}
        <div className="db-panel glow db-weekly-progress">
          <div className="db-panel-title">Weekly Progress</div>
          <div className="db-weekly-chart" role="img" aria-label="XP earned per day this week">
            {weeklyXP.map((d, i) => (
              <div className="db-weekly-bar-col" key={i}>
                <div className="db-weekly-bar-track">
                  <div
                    className="db-weekly-bar-fill"
                    style={{ height: `${Math.max((d.xp / maxWeeklyXP) * 100, d.xp > 0 ? 6 : 2)}%` }}
                    title={`${d.xp} XP`}
                  />
                </div>
                <span className="db-weekly-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
          <GlowTrace />
        </div>

      </section>
    </div>
  );
}