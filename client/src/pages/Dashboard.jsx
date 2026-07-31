import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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
      className={`db-mission-row ${!done ? "db-mission-row--active" : "db-mission-row--done"} ${isDragging ? "db-mission-row--dragging" : ""}`}
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
// Recent Relics slideshow — cycles through every unlocked relic, tinting
// name + glow per rarity tier (mirrors the tokens in styles/relics.css).
const RELIC_ROTATE_MS = 2800;
const RARITY_COLOR = {
  Common: "#8b5cf6",
  Rare: "#a855f7",
  Epic: "#c084fc",
  Legendary: "#fabb32",
  Mythic: "#f8fafc",
};
const RARITY_GLOW = {
  Common: "rgba(139,92,246,0.55)",
  Rare: "rgba(168,85,247,0.55)",
  Epic: "rgba(192,132,252,0.55)",
  Legendary: "rgba(250,189,50,0.55)",
  Mythic: "rgba(255,255,255,0.55)",
};

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

  // Recent Relics slideshow — loops through every unlocked relic (catalog
  // order, common → mythic) a few seconds at a time. Paused on hover.
  const [relicIndex, setRelicIndex] = useState(0);
  const [relicPaused, setRelicPaused] = useState(false);
  useEffect(() => {
    if (unlockedRelics.length <= 1 || relicPaused) return;
    const timer = setInterval(() => {
      setRelicIndex((i) => (i + 1) % unlockedRelics.length);
    }, RELIC_ROTATE_MS);
    return () => clearInterval(timer);
  }, [unlockedRelics.length, relicPaused]);
  const showcaseRelic = unlockedRelics.length > 0
    ? unlockedRelics[relicIndex % unlockedRelics.length]
    : null;

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

  // Today's missions — incomplete first (so finishing one visibly
  // sends it to the bottom of the list), all missions shown; the list
  // itself scrolls (see .db-mission-list) rather than truncating.
  const displayMissions = useMemo(
    () => [...missions].sort((a, b) => Number(a.completed) - Number(b.completed)),
    [missions]
  );

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
        <div className="db-stat-card db-stat-streak glow">
          <div className="db-stat-label">Daily Streak</div>
          <div className="db-stat-streak-row">
            <StreakLogo className="db-stat-streak-logo" size={32} />
            <span className="db-stat-value">{currentStreak}D</span>
          </div>
          <div className="db-stat-sub">Keep it burning!</div>
          <GlowTrace />
        </div>

        {/* Add Mission — mobile-only shortcut, sits beside the Daily Streak /
            Progress tiles (hidden on desktop, where the Add Mission shortcut
            instead sits beside Recent Relics below) */}
        <button
          type="button"
          className="db-stat-add-mission-btn"
          onClick={() => onNavigate?.("Missions")}
          aria-label="Add mission"
        >
          <PlusIcon />
          <span>Add<br />Mission</span>
        </button>

        {/* Progress % (completed / total missions today) */}
        <div className="db-stat-card db-stat-progress glow">
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
        <div className="db-stat-card db-stat-relics glow">
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
        <div className="db-stat-card db-stat-objectives glow">
          <div className="db-stat-label">Objectives</div>
          <div className="db-stat-level-row">
            <div>
              <div className="db-stat-value">{objectivesAchieved}<span className="db-stat-value-of">/{objectives.length}</span></div>
              <div className="db-stat-sub">Long-term goals</div>
            </div>
            <span className="db-stat-icon-badge"><CheckCircle /></span>
          </div>
          <GlowTrace />
        </div>
      </section>

      {/* Bottom: Missions | (Aura Overview + Weekly Progress row, Recent Relics below) */}
      <section className="db-bottom" aria-label="Dashboard panels">

        {/* TODAY'S MISSIONS */}
        <div className="db-panel glow db-missions-panel">
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

        {/* RIGHT COLUMN — stretches to match Missions' height:
            top row = Recent Relics + Add Mission button (mobile-only,
            hidden on desktop) side by side, bottom row = Aura Overview
            + Weekly Progress side by side */}
        <div className="db-bottom-right">

          {/* RECENT RELICS (+ mobile Add Mission shortcut) */}
          <div className="db-relics-wrap">
            <div
              className="db-panel glow db-recent-relics"
              onMouseEnter={() => setRelicPaused(true)}
              onMouseLeave={() => setRelicPaused(false)}
            >
              <div className="db-panel-title">Recent Relics</div>
              {showcaseRelic ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showcaseRelic.id}
                      className="db-relics-row"
                      initial={{ opacity: 0, x: 26, scale: 0.94, filter: "blur(6px)" }}
                      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -26, scale: 0.94, filter: "blur(6px)" }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <img
                        src={getRelicImage(showcaseRelic.id)}
                        alt={showcaseRelic.name}
                        className="db-relics-icon"
                        style={{ filter: `drop-shadow(0 0 10px ${RARITY_GLOW[showcaseRelic.rarity] || "rgba(168,85,247,0.55)"})` }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <div>
                        <div
                          className="db-relics-name"
                          style={{ color: RARITY_COLOR[showcaseRelic.rarity] || undefined }}
                        >
                          {showcaseRelic.name}
                        </div>
                        <div className="db-stat-sub">{showcaseRelic.rarity}</div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  {unlockedRelics.length > 1 && (
                    <div className="db-relics-progress" key={`${showcaseRelic.id}-bar`}>
                      <div
                        className="db-relics-progress-fill"
                        style={{ animationDuration: `${RELIC_ROTATE_MS}ms`, animationPlayState: relicPaused ? "paused" : "running" }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="db-stat-sub">No relics unlocked yet</div>
              )}
              <GlowTrace />
            </div>

            {/* Add Mission — compact icon-only shortcut, sits beside
                Recent Relics on desktop (hidden on mobile, where the
                labeled version already sits in db-stats above) */}
            <button
              type="button"
              className="db-relics-add-btn"
              onClick={() => onNavigate?.("Missions")}
              aria-label="Add mission"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="db-bottom-right-top">

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

          </div>
        </div>

      </section>
    </div>
  );
}