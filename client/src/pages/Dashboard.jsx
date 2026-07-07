import { useState, useMemo } from "react";
import { useXP } from "../context/XPContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { computeStreaks } from "../components/ActivityGrid.jsx";
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

// Mission emoji icons — matched to category
function missionEmoji(m) {
  const title = (m.title || "").toLowerCase();
  if (title.includes("meditat") || title.includes("mind")) return "🔮";
  if (title.includes("workout") || title.includes("train") || title.includes("gym")) return "⚔️";
  if (title.includes("read") || title.includes("book") || title.includes("page")) return "📖";
  if (title.includes("shower") || title.includes("cold")) return "💎";
  if (title.includes("sleep") || title.includes("rest")) return "🌙";
  if (title.includes("sugar") || title.includes("diet")) return "🎯";
  return "✦";
}

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

// ── Level badge SVG ────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  return (
    <svg viewBox="0 0 48 48" className="db-stat-level-badge" aria-label={`Level ${level}`}>
      <defs>
        <radialGradient id="badge-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.4)" />
          <stop offset="100%" stopColor="rgba(80,20,160,0.1)" />
        </radialGradient>
      </defs>
      <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="url(#badge-bg)" stroke="#a855f7" strokeWidth="1.5" />
      <polygon points="24,10 38,18 38,30 24,38 10,30 10,18" fill="rgba(139,92,246,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
      <text x="24" y="29" textAnchor="middle" fontSize="16" fontWeight="700" fill="#f1ecfb" fontFamily="Inter,sans-serif">{level}</text>
    </svg>
  );
}

// ── Sparkline wave ──────────────────────────────────────────────────────────
function Sparkline({ xp }) {
  const w = 160, h = 28;
  const pts = [0.4, 0.5, 0.45, 0.6, 0.55, 0.65, 0.8].map((y, i) => [
    (i / 6) * w,
    h - y * (h - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="db-aura-wave" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wave-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#wave-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ missions = [], setMissions, onNavigate }) {
  const { totalXP, xpIntoLevel, xpNeededForNextLevel, level, rankTitle } = useXP();
  const { user } = useAuth();

  // Compute current streak from stored daily snapshots
  const currentStreak = useMemo(() => {
    try {
      const raw = localStorage.getItem("daily-snapshots");
      const days = raw ? JSON.parse(raw) : [];
      const { current } = computeStreaks(days);
      return current;
    } catch {
      return 0;
    }
  }, []);

  // Daily progress: completed missions / total missions
  const completedToday = missions.filter((m) => m.completed).length;
  const totalToday = missions.length;
  const dailyPct = totalToday > 0 ? completedToday / totalToday : 0;

  // XP bar
  const xpPct = xpNeededForNextLevel > 0 ? xpIntoLevel / xpNeededForNextLevel : 0;
  const xpToNext = xpNeededForNextLevel - xpIntoLevel;

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
      <section className="db-hero" aria-label="Hero">
        <div className="db-hero-content">
          <h1 className="db-hero-title">Become What<br />You Dreamt For.</h1>
          <p className="db-hero-sub">
            Every mission completed today builds<br />
            the person you want to become tomorrow.
          </p>
        </div>
      </section>

      {/* 4 Stat cards */}
      <section className="db-stats" aria-label="Stats">
        {/* Aura Level */}
        <div className="db-stat-card">
          <div className="db-stat-label">Aura Level</div>
          <div className="db-stat-level-row">
            <div>
              <div className="db-stat-value">{level}</div>
              <div className="db-stat-rank">{rankTitle || "Elite Cultivator"}</div>
            </div>
            <LevelBadge level={level} />
          </div>
        </div>

        {/* Aura XP */}
        <div className="db-stat-card">
          <div className="db-stat-label">Aura XP</div>
          <div className="db-stat-value" style={{ fontSize: 24 }}>
            {xpIntoLevel.toLocaleString()}
            <span style={{ fontSize: 15, color: "#8b7faa", fontWeight: 500 }}>
              {" "}/ {xpNeededForNextLevel.toLocaleString()}
            </span>
          </div>
          <div className="db-xp-bar-wrap">
            <div className="db-xp-bar" style={{ width: `${xpPct * 100}%` }} />
          </div>
          <div className="db-stat-sub">+{xpToNext.toLocaleString()} XP to next level</div>
        </div>

        {/* Current Streak */}
        <div className="db-stat-card">
          <div className="db-stat-label">Current Streak</div>
          <div className="db-stat-streak-row">
            <span className="db-stat-flame">🔥</span>
            <span className="db-stat-value">{currentStreak} Days</span>
          </div>
          <div className="db-stat-sub">Keep it burning!</div>
        </div>

        {/* Daily Progress */}
        <div className="db-stat-card">
          <div className="db-stat-label">Daily Progress</div>
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
        </div>
      </section>

      {/* Bottom 3 columns */}
      <section className="db-bottom" aria-label="Dashboard panels">

        {/* TODAY'S MISSIONS */}
        <div className="db-panel">
          <div className="db-panel-title">Today's Missions</div>
          <div className="db-mission-list">
            {displayMissions.length === 0 && (
              <p style={{ color: "#8b7faa", fontSize: 12, textAlign: "center", padding: "16px 0" }}>
                No missions yet. Add some in Missions.
              </p>
            )}
            {displayMissions.map((m) => {
              const done = m.completed;
              return (
                <div
                  key={m.id}
                  className={`db-mission-row ${!done ? "db-mission-row--active" : ""}`}
                >
                  <span className="db-mission-icon">{missionEmoji(m)}</span>
                  <div className="db-mission-info">
                    <div className="db-mission-title">{m.title}</div>
                    <div className="db-mission-sub">
                      {m.category || "General"}
                    </div>
                  </div>
                  {done ? (
                    <span className="db-mission-status db-mission-status--done">
                      Completed <CheckCircle />
                    </span>
                  ) : (
                    <>
                      <span className="db-mission-pct">0%</span>
                      <button
                        className="db-mission-arrow"
                        onClick={() => handleCompleteMission(m.id)}
                        aria-label={`Complete ${m.title}`}
                        title="Mark complete"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button
            className="db-view-all"
            onClick={() => onNavigate?.("Missions")}
          >
            View All Missions <ArrowRight />
          </button>
        </div>

        {/* AURA OVERVIEW */}
        <div className="db-panel">
          <div className="db-panel-title">Aura Overview</div>
          <div className="db-aura-ring-wrap">
            <div className="db-aura-ring">
              <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                <defs>
                  <linearGradient id="aura-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="60%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="65" cy="65" r="52"
                  fill="none"
                  stroke="url(#aura-ring-gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(xpPct + 0.1, 0.98))}
                  style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.7))", transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="db-aura-ring-center">
                <span className="db-aura-ring-value">{totalXP.toLocaleString()}</span>
                <span className="db-aura-ring-sub">Total Aura XP</span>
              </div>
            </div>
            <p className="db-aura-delta">
              <span>+ 18%</span> from yesterday
            </p>
            <Sparkline xp={totalXP} />
          </div>
        </div>

        {/* RECENT ACHIEVEMENT */}
        <div className="db-panel">
          <div className="db-panel-title">Recent Achievement</div>
          <div className="db-achievement">
            <div className="db-achievement-badge">
              <span className="db-achievement-badge-icon">🏆</span>
            </div>
            <div className="db-achievement-name">Unstoppable</div>
            <div className="db-achievement-desc">
              Maintain a 20+ day streak
            </div>
            <div className="db-achievement-xp">+500 XP</div>
            <button
              className="db-view-all"
              style={{ marginTop: 12, justifyContent: "center" }}
              onClick={() => onNavigate?.("Relics")}
            >
              View All Relics <ArrowRight />
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}