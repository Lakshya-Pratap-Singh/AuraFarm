import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXP, MISSION_XP_TABLE } from "../context/XPContext.jsx";
import { useBanner, getHeroBackgroundStyle } from "../context/BannerContext.jsx";
import useSwipeGesture from "../hooks/useSwipeGesture.js";
import handleLiquidCursor from "../hooks/handleLiquidCursor.js";
import { buildNewMission } from "../hooks/useMissionReset.js";
import CategoryBadge from "../components/common/CategoryBadge.jsx";
import StreakLogo from "../components/common/StreakLogo.jsx";
import "../styles/missions-aura.css";

// ─── Config ───────────────────────────────────────────────────────────────
export const PRIORITY_CONFIG = {
  Low:    { label: "LOW",    badgeClass: "mc-badge--priority-low" },
  Medium: { label: "MED",   badgeClass: "mc-badge--priority-medium" },
  High:   { label: "HIGH",  badgeClass: "mc-badge--priority-high" },
};

export const DIFFICULTY_CONFIG = {
  Easy:      { label: "EASY",      badgeClass: "mc-badge--difficulty-easy" },
  Normal:    { label: "NORMAL",    badgeClass: "mc-badge--difficulty-normal" },
  Hard:      { label: "HARD",      badgeClass: "mc-badge--difficulty-hard" },
  Legendary: { label: "LEGENDARY", badgeClass: "mc-badge--difficulty-legendary" },
};

export const CATEGORY_CONFIG = {
  Physical:  { label: "PHYSICAL",  color: "#f97316", icon: "💪" },
  Mental:    { label: "MENTAL",    color: "#8b5cf6", icon: "🧠" },
  Career:    { label: "CAREER",    color: "#eab308", icon: "💼" },
  Learning:  { label: "LEARNING",  color: "#38bdf8", icon: "📖" },
  Health:    { label: "HEALTH",    color: "#22c55e", icon: "❤️" },
  Lifestyle: { label: "LIFESTYLE", color: "#e879f9", icon: "✨" },
  Social:    { label: "SOCIAL",    color: "#fb923c", icon: "🤝" },
  Finance:   { label: "FINANCE",   color: "#4ade80", icon: "💰" },
  Spiritual: { label: "SPIRITUAL", color: "#c084fc", icon: "🔮" },
};

export const RECURRENCE_CONFIG = {
  none:    { label: "One-time",      icon: "✦",  desc: "Does not repeat" },
  daily:   { label: "Daily",         icon: "🔁", desc: "Resets every day at midnight" },
  weekly:  { label: "Weekly",        icon: "📅", desc: "Resets every 7 days" },
  monthly: { label: "Monthly",       icon: "🗓️", desc: "Resets every 30 days" },
  custom:  { label: "Every N days",  icon: "⚡", desc: "Custom interval" },
};

// ─── Icons ────────────────────────────────────────────────────────────────
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

// ─── Edit Modal ───────────────────────────────────────────────────────────
function EditModal({ mission, objectives, onSave, onClose }) {
  const [title,          setTitle]          = useState(mission.title);
  const [priority,       setPriority]       = useState(mission.priority       || "Medium");
  const [difficulty,     setDifficulty]     = useState(mission.difficulty     || "Normal");
  const [category,       setCategory]       = useState(mission.category       || "Learning");
  const [recurrence,     setRecurrence]     = useState(mission.recurrence     || "none");
  const [recurrenceDays, setRecurrenceDays] = useState(mission.recurrenceDays || 1);
  const [objectiveId,    setObjectiveId]    = useState(mission.objectiveId    || "");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...mission,
      title:          title.trim(),
      priority, difficulty, category,
      recurrence,
      recurrenceDays: recurrence === "custom" ? Number(recurrenceDays) : 1,
      objectiveId:    objectiveId ? Number(objectiveId) : null,
    });
  };

  return (
    <div className="mission-edit-backdrop" onClick={onClose}>
      <div className="mission-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="mission-edit-header">
          <span className="mission-edit-title-label">Edit Mission</span>
          <button className="mission-edit-close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="af-field-group">
          <label className="af-field-label">Mission Name</label>
          <input
            className="af-field-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>

        <div className="af-field-row">
          <div className="af-field-group">
            <label className="af-field-label">Category</label>
            <select className="af-field-select" value={category} onChange={e => setCategory(e.target.value)}>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="af-field-group">
            <label className="af-field-label">Priority</label>
            <select className="af-field-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="af-field-row">
          <div className="af-field-group">
            <label className="af-field-label">Difficulty</label>
            <select className="af-field-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="Easy">Easy</option>
              <option value="Normal">Normal</option>
              <option value="Hard">Hard</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
          <div className="af-field-group">
            <label className="af-field-label">Repeat</label>
            <select className="af-field-select" value={recurrence} onChange={e => setRecurrence(e.target.value)}>
              {Object.entries(RECURRENCE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {recurrence === "custom" && (
          <div className="af-field-group">
            <label className="af-field-label">Every how many days?</label>
            <input
              className="af-field-input"
              type="number"
              min="1" max="365"
              value={recurrenceDays}
              onChange={e => setRecurrenceDays(e.target.value)}
            />
          </div>
        )}

        {recurrence !== "none" && (
          <div className="mission-recurrence-hint">
            {RECURRENCE_CONFIG[recurrence]?.desc}
            {recurrence === "custom" && ` — every ${recurrenceDays} day${recurrenceDays !== 1 ? "s" : ""}`}
          </div>
        )}

        {objectives?.length > 0 && (
          <div className="af-field-group">
            <label className="af-field-label">Link to Objective</label>
            <select className="af-field-select" value={objectiveId} onChange={e => setObjectiveId(e.target.value)}>
              <option value="">— None —</option>
              {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          </div>
        )}

        <div className="mission-edit-actions">
          <button className="btn-deploy-aura" onClick={handleSave} disabled={!title.trim()}>
            Save Mission
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Mission Card ──────────────────────────────────────────────────
function MissionCard({ mission, onComplete, onDelete, onEdit }) {
  const xpReward     = MISSION_XP_TABLE?.[mission.difficulty] ?? 80;
  const priorityCfg  = PRIORITY_CONFIG[mission.priority]   || PRIORITY_CONFIG.Medium;
  const difficultyCfg= DIFFICULTY_CONFIG[mission.difficulty]|| DIFFICULTY_CONFIG.Normal;
  const categoryCfg  = CATEGORY_CONFIG[mission.category]   || CATEGORY_CONFIG.Learning;
  const recurrenceCfg= RECURRENCE_CONFIG[mission.recurrence]|| RECURRENCE_CONFIG.none;

  // Swipe gesture
  const { trackRef, fillPct, leftPct, isDragging, direction, handlers } = useSwipeGesture({
    bidirectional:   true,
    ignoreSelector: ".mc-aura-delete,.mc-swipe-btn",
    onComplete:      mission.completed ? undefined : () => onComplete(mission.id),
    onEdit:          mission.completed ? () => onComplete(mission.id) : () => onEdit(mission),
  });

  // Visual state
  const swipeStage = fillPct >= 0.85 ? "ready" : fillPct >= 0.4 ? "progress" : "idle";
  const isRightDrag = isDragging && direction === "right";
  const isLeftDrag  = isDragging && direction === "left";

  const classes = [
    "mc-aura",
    mission.completed ? "mc-aura--completed" : "mc-aura--active",
    isDragging        ? "mc-aura--dragging"  : "",
    isRightDrag && swipeStage !== "idle" ? `mc-swipe-stage--${swipeStage}` : "",
  ].filter(Boolean).join(" ");

  return (
    <article ref={trackRef} className={classes} {...handlers}>
      {/* Left accent pulse bar */}
      <div className="mc-aura-accent" />

      {/* ── RIGHT-SWIPE FILL OVERLAY ── */}
      {isRightDrag && fillPct > 0 && (
        <div
          className={`mc-swipe-fill mc-swipe-fill--${swipeStage}`}
          style={{ width: `${fillPct * 100}%` }}
          aria-hidden="true"
        >
          {fillPct > 0.35 && (
            <span className="mc-swipe-fill-label">
              {swipeStage === "ready" ? "✓ RELEASE" : `${Math.round(fillPct * 100)}%`}
            </span>
          )}
        </div>
      )}

      {/* ── LEFT-SWIPE EDIT REVEAL ── */}
      {isLeftDrag && leftPct > 0 && (
        <div
          className="mc-swipe-edit-reveal"
          style={{ opacity: Math.min(leftPct * 2, 1) }}
          aria-hidden="true"
        >
          <EditIcon />
          <span>{mission.completed ? "REOPEN" : "EDIT"}</span>
        </div>
      )}

      {/* Category sigil via CategoryBadge */}
      <div className="mc-aura-icon">
        <CategoryBadge category={mission.category} size="lg" showLabel={false} />
      </div>

      {/* Body */}
      <div className="mc-aura-body">
        <div className="mc-aura-title-row">
          <span className="mc-aura-title">{mission.title}</span>
          {mission.recurrence && mission.recurrence !== "none" && (
            <span className="mc-recurrence-pill" title={recurrenceCfg.desc}>
              {recurrenceCfg.icon} {recurrenceCfg.label}
            </span>
          )}
        </div>
        <div className="mc-aura-badges">
          <CategoryBadge category={mission.category} size="xs" showIcon={false} />
          <span className={`mc-badge ${priorityCfg.badgeClass}`}>{priorityCfg.label}</span>
          <span className={`mc-badge ${difficultyCfg.badgeClass}`}>{difficultyCfg.label}</span>
          <span className="mc-badge mc-badge--xp">+{xpReward} XP</span>
        </div>
      </div>

      {/* Right side */}
      <div className="mc-aura-right">
        <span className="mc-swipe-hint" aria-hidden="true">
          {mission.completed ? "←" : "→"}
        </span>
        {mission.completed ? (
          <div className="mc-aura-completed-badge">
            <CheckCircleIcon />
            <span>DONE</span>
          </div>
        ) : null}
        <button
          className="mc-aura-delete btn-delete-expand"
          onClick={e => { e.stopPropagation(); onDelete(mission.id); }}
          aria-label="Delete mission"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

// ─── Category Filter Pills ────────────────────────────────────────────────
function CategoryFilters({ active, onChange, missions }) {
  const counts = {};
  missions.forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });

  return (
    <div className="mc-category-filters">
      <button
        className={`mc-cat-pill ${active === null ? "mc-cat-pill--active" : ""}`}
        onClick={() => onChange(null)}
      >
        All <span className="mc-cat-count">{missions.length}</span>
      </button>
      {Object.entries(CATEGORY_CONFIG).filter(([k]) => counts[k]).map(([k, v]) => (
        <button
          key={k}
          className={`mc-cat-pill ${active === k ? "mc-cat-pill--active" : ""}`}
          style={active === k ? { borderColor: v.color, color: v.color, background: v.color + "18" } : {}}
          onClick={() => onChange(k)}
        >
          {v.icon} {v.label} <span className="mc-cat-count">{counts[k]}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────
function computeStats(missions) {
  const total     = missions.length;
  const completed = missions.filter(m => m.completed).length;
  const active    = total - completed;
  const rate      = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, active, rate };
}

// ─── Missions Page ────────────────────────────────────────────────────────
function Missions({ missions, setMissions, objectives = [] }) {
  const [showAdd,       setShowAdd]       = useState(false);
  const [editingMission,setEditingMission]= useState(null);
  const [categoryFilter,setCategoryFilter]= useState(null);

  // Add form state
  const [missionInput,    setMissionInput]    = useState("");
  const [selectedObjective,setSelectedObjective]= useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [selectedDifficulty,setSelectedDifficulty]=useState("Normal");
  const [selectedCategory, setSelectedCategory] = useState("Learning");
  const [selectedRecurrence,setSelectedRecurrence]=useState("none");
  const [recurrenceDays,  setRecurrenceDays]  = useState(1);

  const { gainXP, totalXP } = useXP();
  const { bannerUrl } = useBanner();

  // Midnight streak from localStorage
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

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAddMission = useCallback(() => {
    if (!missionInput.trim()) return;
    const m = buildNewMission({
      title:         missionInput,
      priority:      selectedPriority,
      difficulty:    selectedDifficulty,
      category:      selectedCategory,
      recurrence:    selectedRecurrence,
      recurrenceDays,
      objectiveId:   selectedObjective ? Number(selectedObjective) : null,
    });
    setMissions(prev => [...prev, m]);
    setMissionInput("");
    setSelectedObjective("");
    setSelectedPriority("Medium");
    setSelectedDifficulty("Normal");
    setSelectedCategory("Learning");
    setSelectedRecurrence("none");
    setRecurrenceDays(1);
    setShowAdd(false);
  }, [missionInput, selectedPriority, selectedDifficulty, selectedCategory, selectedRecurrence, recurrenceDays, selectedObjective, setMissions]);

  const handleComplete = useCallback((id) => {
    const target = missions.find(m => m.id === id);
    if (!target) return;
    const willComplete = !target.completed;
    const xpValue = MISSION_XP_TABLE?.[target.difficulty] ?? 80;
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: willComplete } : m));
    gainXP(willComplete ? xpValue : -xpValue);
  }, [missions, setMissions, gainXP]);

  const handleDelete = useCallback((id) => {
    setMissions(prev => prev.filter(m => m.id !== id));
  }, [setMissions]);

  const handleSaveEdit = useCallback((updated) => {
    setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    setEditingMission(null);
  }, [setMissions]);

  // ── Filtered list ────────────────────────────────────────────────────
  const filtered = categoryFilter
    ? missions.filter(m => m.category === categoryFilter)
    : missions;

  const activeMissions    = filtered.filter(m => !m.completed);
  const completedMissions = filtered.filter(m => m.completed);
  const stats = computeStats(missions);
  const weeklyXpGoal = 4000;
  const xpBarPct = Math.min((totalXP / weeklyXpGoal) * 100, 100);

  return (
    <div className="missions-page">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="missions-hero" style={getHeroBackgroundStyle(bannerUrl)}>
        <h1 className="missions-hero-heading">Missions</h1>
        <p className="missions-hero-sub">Complete missions. Earn Aura XP. Forge your legacy.</p>
        <p className="mc-swipe-instructions">
          <span>→ Swipe right to complete</span>
          <span>← Swipe left to edit</span>
        </p>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────── */}
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
          <span className="missions-stat-label">Done</span>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="missions-toolbar">
        <div>
          <div className="missions-section-title">Today's Missions</div>
          <div className="missions-count-badge">{missions.length} mission{missions.length !== 1 ? "s" : ""}</div>
        </div>
        <button
          className="btn-add-mission btn-add-expand"
          onClick={() => setShowAdd(v => !v)}
          onMouseMove={handleLiquidCursor}
          aria-label={showAdd ? "Cancel" : "Add Mission"}
        >
          <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <filter id="btn-liquid-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </svg>
          <span className="btn-liquid" aria-hidden="true">
            <span className="btn-liquid-blob btn-liquid-blob--a" />
            <span className="btn-liquid-blob btn-liquid-blob--b" />
            <span className="btn-liquid-cursor" />
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          <span className="btn-add-expand-label">{showAdd ? "Cancel" : "Add Mission"}</span>
        </button>
      </div>

      {/* ── Add panel ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="form-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              className="form-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="form-modal-close" onClick={() => setShowAdd(false)} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
              <div className="form-modal-title">New Mission</div>

              <div className="af-field-group">
                <label className="af-field-label" htmlFor="af-mission-name">Mission Name</label>
                <input
                  id="af-mission-name"
                  className="af-field-input"
                  type="text"
                  placeholder="Name your mission…"
                  value={missionInput}
                  onChange={e => setMissionInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddMission()}
                  autoFocus
                />
              </div>

              <div className="af-field-row">
                <div className="af-field-group">
                  <label className="af-field-label">Category</label>
                  <select className="af-field-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="af-field-group">
                  <label className="af-field-label">Priority</label>
                  <select className="af-field-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="af-field-row">
                <div className="af-field-group">
                  <label className="af-field-label">Difficulty</label>
                  <select className="af-field-select" value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Normal">Normal</option>
                    <option value="Hard">Hard</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
                <div className="af-field-group">
                  <label className="af-field-label">Repeat</label>
                  <select className="af-field-select" value={selectedRecurrence} onChange={e => setSelectedRecurrence(e.target.value)}>
                    {Object.entries(RECURRENCE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRecurrence === "custom" && (
                <div className="af-field-group">
                  <label className="af-field-label">Every how many days?</label>
                  <input
                    className="af-field-input"
                    type="number"
                    min="1" max="365"
                    value={recurrenceDays}
                    onChange={e => setRecurrenceDays(e.target.value)}
                  />
                </div>
              )}

              {selectedRecurrence !== "none" && (
                <div className="mission-recurrence-hint">
                  {RECURRENCE_CONFIG[selectedRecurrence]?.desc}
                  {selectedRecurrence === "custom" && ` — every ${recurrenceDays} day${Number(recurrenceDays) !== 1 ? "s" : ""}`}
                </div>
              )}

              {objectives?.length > 0 && (
                <div className="af-field-group">
                  <label className="af-field-label">Link to Objective</label>
                  <select className="af-field-select" value={selectedObjective} onChange={e => setSelectedObjective(e.target.value)}>
                    <option value="">— None —</option>
                    {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </select>
                </div>
              )}

              <button className="btn-deploy-aura" onClick={handleAddMission} disabled={!missionInput.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
                Deploy Mission
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category filter pills ─────────────────────────────── */}
      {missions.length > 0 && (
        <CategoryFilters
          active={categoryFilter}
          onChange={setCategoryFilter}
          missions={missions}
        />
      )}

      {/* ── Mission list ─────────────────────────────────────── */}
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
          {activeMissions.length > 0 && (
            <>
              <div className="mc-list-section-label">Active</div>
              {activeMissions.map(m => (
                <MissionCard key={m.id} mission={m}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onEdit={setEditingMission}
                />
              ))}
            </>
          )}
          {completedMissions.length > 0 && (
            <>
              <div className="mc-list-section-label mc-list-section-label--done">Completed</div>
              {completedMissions.map(m => (
                <MissionCard key={m.id} mission={m}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onEdit={setEditingMission}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Footer stats ─────────────────────────────────────── */}
      <div className="missions-footer-stats">
        <div className="mf-stat">
          <span className="mf-stat-label">Mission Streak</span>
          <div className="mf-stat-value-row">
            <StreakLogo className="mf-stat-streak-logo" size={26} />
            <span className="mf-stat-value">{currentStreak ?? 0}</span>
          </div>
          <span className="mf-stat-sub">Days</span>
        </div>
        <div className="mf-stat">
          <span className="mf-stat-label">Total Aura XP</span>
          <span className="mf-stat-value">{totalXP?.toLocaleString() ?? 0}</span>
          <div className="mf-stat-bar"><div className="mf-stat-bar-fill" style={{ width: `${xpBarPct}%` }}/></div>
        </div>
        <div className="mf-stat">
          <span className="mf-stat-label">Missions Done</span>
          <span className="mf-stat-value">{stats.completed}</span>
          <span className="mf-stat-sub">of {stats.total} total</span>
        </div>
      </div>

      {/* ── Edit modal ───────────────────────────────────────── */}
      {editingMission && (
        <EditModal
          mission={editingMission}
          objectives={objectives}
          onSave={handleSaveEdit}
          onClose={() => setEditingMission(null)}
        />
      )}
    </div>
  );
}

export default Missions;