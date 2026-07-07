import { useState } from "react";
import { useXP, MISSION_XP_TABLE } from "../context/XPContext.jsx";
import useSwipeGesture from "../hooks/useSwipeGesture.js";
import { useEffect } from "react";
import "../styles/missions-aura.css";

export const PRIORITY_CONFIG = {
  Low:    { label: "LOW",    level: 1, badgeClass: "mc-badge--priority-low" },
  Medium: { label: "MED",   level: 2, badgeClass: "mc-badge--priority-medium" },
  High:   { label: "HIGH",  level: 3, badgeClass: "mc-badge--priority-high" },
};

export const DIFFICULTY_CONFIG = {
  Easy:      { label: "EASY",      level: 1, badgeClass: "mc-badge--difficulty-easy" },
  Normal:    { label: "NORMAL",    level: 2, badgeClass: "mc-badge--difficulty-normal" },
  Hard:      { label: "HARD",      level: 3, badgeClass: "mc-badge--difficulty-hard" },
  Legendary: { label: "LEGENDARY", level: 4, badgeClass: "mc-badge--difficulty-legendary" },
};

export const CATEGORY_CONFIG = {
  Physical: { label: "BODY",      accent: "category-physical" },
  Mental:   { label: "MIND",      accent: "category-mental" },
  Career:   { label: "CAREER",    accent: "category-career" },
  Learning: { label: "LEARNING",  accent: "category-learning" },
  Health:   { label: "HEALTH",    accent: "category-health" },
};

// Category icons — different SVG per category
function CategoryIcon({ category }) {
  const icons = {
    Physical: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4v16M18 4v16M6 12h12" strokeLinecap="round"/></svg>,
    Mental:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14v-4m0-4h.01" strokeLinecap="round"/></svg>,
    Career:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    Learning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    Health:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  };
  return icons[category] || icons.Learning;
}

const PROGRESS_THRESHOLD = 0.5;
const COMPLETE_THRESHOLD = 0.85;

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round"/>
    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Single Mission Card (AuraFarm row layout) ─────────────────
function MissionCard({ mission, onComplete, onDelete }) {
  const xpReward = MISSION_XP_TABLE[mission.difficulty] || MISSION_XP_TABLE.Normal;
  const priorityCfg = PRIORITY_CONFIG[mission.priority] || PRIORITY_CONFIG.Medium;
  const difficultyCfg = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.Normal;
  const categoryLabel = CATEGORY_CONFIG[mission.category]?.label || mission.category;

  const [justCompleted, setJustCompleted] = useState(false);
  useEffect(() => {
    if (mission.completed) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 900);
      return () => clearTimeout(t);
    }
  }, [mission.completed]);

  const { trackRef, dragX, trackWidth, isDragging, handlers } = useSwipeGesture({
    disabled: mission.completed,
    ignoreSelector: ".btn-card,.mc-aura-delete,.mc-swipe-btn",
    onRelease: (finalX, finalWidth) => {
      if (finalWidth > 0 && finalX / finalWidth >= COMPLETE_THRESHOLD) {
        onComplete(mission.id);
      }
    },
  });

  const swipePct = trackWidth > 0 ? Math.min(dragX / trackWidth, 1) : 0;
  const swipeStage = swipePct >= COMPLETE_THRESHOLD ? "ready" : swipePct >= PROGRESS_THRESHOLD ? "progress" : "idle";

  const classes = [
    "mc-aura",
    mission.completed ? "mc-aura--completed" : "mc-aura--active",
    isDragging ? "mc-aura--dragging" : "",
    isDragging ? `mc-swipe-stage--${swipeStage}` : "",
    justCompleted ? "mc-celebrate" : "",
  ].filter(Boolean).join(" ");

  return (
    <article
      ref={trackRef}
      className={classes}
      style={isDragging ? { transform: `translateX(${dragX}px)` } : undefined}
      {...handlers}
    >
      <div className="mc-aura-accent" />

      {isDragging && (
        <div className="mc-swipe-overlay-aura" aria-hidden="true">
          <ChevronIcon />
          <span>{swipeStage === "ready" ? "RELEASE TO COMPLETE" : "KEEP SWIPING →"}</span>
        </div>
      )}

      <div className="mc-aura-icon">
        <CategoryIcon category={mission.category} />
      </div>

      <div className="mc-aura-body">
        <span className="mc-aura-title">{mission.title}</span>
        <div className="mc-aura-badges">
          <span className="mc-badge mc-badge--category">{categoryLabel}</span>
          <span className={`mc-badge ${priorityCfg.badgeClass}`}>{priorityCfg.label}</span>
          <span className={`mc-badge ${difficultyCfg.badgeClass}`}>{difficultyCfg.label}</span>
          <span className="mc-badge mc-badge--xp">+{xpReward} XP</span>
        </div>
      </div>

      <div className="mc-aura-right">
        {mission.completed ? (
          <div className="mc-aura-completed-badge">
            <CheckCircleIcon />
            <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}>DONE</span>
          </div>
        ) : (
          <button
            className="mc-swipe-btn btn-card"
            onClick={() => onComplete(mission.id)}
            aria-label="Complete mission"
          >
            <ChevronIcon />
          </button>
        )}
        <button
          className="mc-aura-delete"
          onClick={() => onDelete(mission.id)}
          aria-label="Delete mission"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

// ── Computed stats ─────────────────────────────────────────────
function computeStats(missions) {
  const total = missions.length;
  const completed = missions.filter((m) => m.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, active, rate };
}

// ── Missions page ──────────────────────────────────────────────
function Missions({ missions, setMissions, objectives }) {
  const [showAdd, setShowAdd] = useState(false);
  const [missionInput, setMissionInput] = useState("");
  const [selectedObjective, setSelectedObjective] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Normal");
  const [selectedCategory, setSelectedCategory] = useState("Learning");

  const { gainXP, totalXP } = useXP();
  // Streak lives in ActivityGrid's localStorage log — read it directly
  const currentStreak = (() => {
    try {
      const log = JSON.parse(localStorage.getItem("dailywise_activity_log") || "{}");
      const today = new Date(); today.setHours(0,0,0,0);
      let streak = 0;
      for (let i = 0; i < 90; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const k = d.toISOString().slice(0,10);
        if (log[k]?.rate > 0) streak++; else break;
      }
      return streak;
    } catch { return 0; }
  })();

  const handleAddMission = () => {
    if (!missionInput.trim()) return;
    setMissions([...missions, {
      id: Date.now(),
      title: missionInput.trim(),
      completed: false,
      objectiveId: selectedObjective ? Number(selectedObjective) : null,
      priority: selectedPriority,
      difficulty: selectedDifficulty,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
    }]);
    setMissionInput("");
    setSelectedObjective("");
    setSelectedPriority("Medium");
    setSelectedDifficulty("Normal");
    setSelectedCategory("Learning");
    setShowAdd(false);
  };

  const handleDeleteMission = (id) => setMissions(missions.filter((m) => m.id !== id));

  const handleCompleteMission = (id) => {
    const target = missions.find((m) => m.id === id);
    if (!target) return;
    const willBeCompleted = !target.completed;
    const xpValue = MISSION_XP_TABLE[target.difficulty] ?? MISSION_XP_TABLE.Normal;
    setMissions(missions.map((m) => m.id === id ? { ...m, completed: willBeCompleted } : m));
    gainXP(willBeCompleted ? xpValue : -xpValue);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleAddMission(); };
  const stats = computeStats(missions);

  // XP bar for footer
  const weeklyXpGoal = 4000;
  const xpBarPct = Math.min((totalXP / weeklyXpGoal) * 100, 100);

  return (
    <div className="missions-page">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="missions-hero">
        <h1 className="missions-hero-heading">Missions</h1>
        <p className="missions-hero-sub">Complete missions. Earn Aura XP. Forge your legacy.</p>
      </div>

      {/* ── Quick stats ────────────────────────────────────────── */}
      <div className="missions-stats-bar">
        <div className="missions-stat">
          <span className="missions-stat-value">{stats.rate}%</span>
          <span className="missions-stat-label">Completion</span>
        </div>
        <div className="missions-stat">
          <span className="missions-stat-value">{stats.active}</span>
          <span className="missions-stat-label">Active</span>
        </div>
        <div className="missions-stat">
          <span className="missions-stat-value">{stats.completed}</span>
          <span className="missions-stat-label">Completed</span>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="missions-toolbar">
        <div>
          <div className="missions-section-title">Today's Missions</div>
          <div className="missions-count-badge">{missions.length} mission{missions.length !== 1 ? "s" : ""} logged</div>
        </div>
        <button className="btn-add-mission" onClick={() => setShowAdd((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          {showAdd ? "Cancel" : "Add Mission"}
        </button>
      </div>

      {/* ── Add panel ───────────────────────────────────────────── */}
      {showAdd && (
        <div className="missions-add-panel">
          <div className="af-field-row--wide af-field-group">
            <label className="af-field-label" htmlFor="af-mission-name">Mission Name</label>
            <input
              id="af-mission-name"
              className="af-field-input"
              type="text"
              placeholder="Name your mission…"
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="af-field-row">
            <div className="af-field-group">
              <label className="af-field-label" htmlFor="af-priority">Priority</label>
              <select id="af-priority" className="af-field-select" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="af-field-group">
              <label className="af-field-label" htmlFor="af-difficulty">Difficulty</label>
              <select id="af-difficulty" className="af-field-select" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Normal">Normal</option>
                <option value="Hard">Hard</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
            <div className="af-field-group">
              <label className="af-field-label" htmlFor="af-category">Category</label>
              <select id="af-category" className="af-field-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="Physical">Physical</option>
                <option value="Mental">Mental</option>
                <option value="Career">Career</option>
                <option value="Learning">Learning</option>
                <option value="Health">Health</option>
              </select>
            </div>
          </div>
          {objectives.length > 0 && (
            <div className="af-field-group">
              <label className="af-field-label" htmlFor="af-objective">Link to Objective</label>
              <select id="af-objective" className="af-field-select" value={selectedObjective} onChange={(e) => setSelectedObjective(e.target.value)}>
                <option value="">— None —</option>
                {objectives.map((obj) => <option key={obj.id} value={obj.id}>{obj.title}</option>)}
              </select>
            </div>
          )}
          <button className="btn-deploy-aura" onClick={handleAddMission} disabled={!missionInput.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
            Deploy Mission
          </button>
        </div>
      )}

      {/* ── Mission list ─────────────────────────────────────────── */}
      {missions.length === 0 ? (
        <div className="missions-empty-aura">
          <div className="missions-empty-icon">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="32" cy="32" r="28" strokeDasharray="4 4"/>
              <circle cx="32" cy="32" r="14"/>
              <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <p className="missions-empty-title">No missions detected</p>
          <p className="missions-empty-sub">Deploy your first mission to begin building your aura.</p>
        </div>
      ) : (
        <div className="mission-list-aura">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onComplete={handleCompleteMission}
              onDelete={handleDeleteMission}
            />
          ))}
        </div>
      )}

      {/* ── Footer stats ─────────────────────────────────────────── */}
      <div className="missions-footer-stats">
        <div className="mf-stat">
          <span className="mf-stat-label">Mission Streak</span>
          <span className="mf-stat-value">{currentStreak ?? 0}</span>
          <span className="mf-stat-sub">Days</span>
        </div>
        <div className="mf-stat">
          <span className="mf-stat-label">Total Aura XP</span>
          <span className="mf-stat-value">{totalXP?.toLocaleString() ?? 0}</span>
          <div className="mf-stat-bar"><div className="mf-stat-bar-fill" style={{ width: `${xpBarPct}%` }} /></div>
        </div>
        <div className="mf-stat">
          <span className="mf-stat-label">Missions Completed</span>
          <span className="mf-stat-value">{stats.completed}</span>
          <span className="mf-stat-sub">of {stats.total} total</span>
        </div>
      </div>
    </div>
  );
}

export default Missions;