import { useState } from "react";
import MissionCard from "../components/MissionCard.jsx";
import { useXP, MISSION_XP_TABLE } from "../context/XPContext.jsx";
import "../styles/missions.css";

export const PRIORITY_CONFIG = {
  Low: { label: "LOW", level: 1, accent: "priority-low" },
  Medium: { label: "MED", level: 2, accent: "priority-medium" },
  High: { label: "HIGH", level: 3, accent: "priority-high" },
};

export const DIFFICULTY_CONFIG = {
  Easy: { label: "EASY", level: 1, accent: "difficulty-easy" },
  Normal: { label: "NORMAL", level: 2, accent: "difficulty-normal" },
  Hard: { label: "HARD", level: 3, accent: "difficulty-hard" },
  Legendary: { label: "LEGENDARY", level: 4, accent: "difficulty-legendary" },
};

export const CATEGORY_CONFIG = {
  Physical: { label: "PHYSICAL", accent: "category-physical" },
  Mental: { label: "MENTAL", accent: "category-mental" },
  Career: { label: "CAREER", accent: "category-career" },
  Learning: { label: "LEARNING", accent: "category-learning" },
  Health: { label: "HEALTH", accent: "category-health" },
};

// ─── Derived stat helpers ─────────────────────────────────────────────────────
function computeStats(missions, objectives) {
  const total = missions.length;
  const completed = missions.filter((m) => m.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const linked = missions.filter((m) => m.objectiveId !== null).length;
  const uniqueLinkedObjs = new Set(
    missions.filter((m) => m.objectiveId).map((m) => m.objectiveId)
  ).size;

  const difficultyValues = missions
    .filter((m) => m.difficulty)
    .map((m) => m.difficulty);
  const averageDifficulty =
    difficultyValues.length === 0
      ? 0
      : Math.round(
          difficultyValues.reduce(
            (sum, value) =>
              sum + (DIFFICULTY_CONFIG[value]?.level || 0),
            0
          ) / difficultyValues.length
        );

  return {
    total,
    completed,
    active,
    rate,
    linked: uniqueLinkedObjs,
    averageDifficulty,
  };
}

// ─── Tactical Overview stat tile ─────────────────────────────────────────────
function StatTile({ label, value, accent }) {
  return (
    <div className={`stat-tile ${accent ? "stat-tile--accent" : ""}`}>
      <span className="stat-tile-value">{value}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
  );
}

// ─── Main Missions page ───────────────────────────────────────────────────────
function Missions({ missions, setMissions, objectives }) {
  // Form state — all local UI state only
  const [missionInput, setMissionInput] = useState("");
  const [selectedObjective, setSelectedObjective] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Normal");
  const [selectedCategory, setSelectedCategory] = useState("Learning");

  const { gainXP } = useXP();

  // ── CRUD handlers (original logic preserved exactly) ──
  const handleAddMission = () => {
    if (!missionInput.trim()) return;

    const newMission = {
      id: Date.now(),
      title: missionInput.trim(),
      completed: false,
      objectiveId: selectedObjective ? Number(selectedObjective) : null,
      priority: selectedPriority,
      difficulty: selectedDifficulty,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
    };

    setMissions([...missions, newMission]);
    setMissionInput("");
    setSelectedObjective("");
    setSelectedPriority("Medium");
    setSelectedDifficulty("Normal");
    setSelectedCategory("Learning");
  };

  const handleDeleteMission = (id) => {
    setMissions(missions.filter((m) => m.id !== id));
  };

  // Toggles completion exactly as before, plus awards/revokes XP based
  // on the transition direction — completing grants XP for the mission's
  // difficulty, reopening symmetrically takes it back. This keeps the
  // toggle from being farmable for infinite XP via repeated complete/reopen.
  const handleCompleteMission = (id) => {
    const target = missions.find((m) => m.id === id);
    if (!target) return;

    const willBeCompleted = !target.completed;
    const xpValue =
      MISSION_XP_TABLE[target.difficulty] ?? MISSION_XP_TABLE.Normal;

    setMissions(
      missions.map((m) =>
        m.id === id
          ? {
              ...m,
              completed: willBeCompleted,
            }
          : m
      )
    );

    gainXP(willBeCompleted ? xpValue : -xpValue);
  };

  // Allow Enter key to submit from the input field
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddMission();
  };

  // ── Derived stats ──
  const stats = computeStats(missions, objectives);

  return (
    <div className="missions-page">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="missions-header">
        <div className="missions-header-title">
          <span className="missions-header-eyebrow">DAILYWISE // TACTICAL OPS</span>
          <h1 className="missions-heading">MISSION CONTROL</h1>
        </div>
        <div className="missions-header-badge">
          <span className="header-badge-dot" />
          SYSTEM ONLINE
        </div>
      </header>

      {/* ── Tactical overview bar ───────────────────────────────────────────── */}
      <section className="overview-bar" aria-label="Mission statistics">
        <StatTile label="COMPLETION RATE" value={`${stats.rate}%`} accent />
        <div className="overview-divider" />
        <StatTile label="ACTIVE" value={stats.active} />
        <div className="overview-divider" />
        <StatTile label="COMPLETED" value={stats.completed} />
        <div className="overview-divider" />
        <StatTile label="OBJ LINKED" value={stats.linked} />
        <div className="overview-divider" />
        <StatTile label="AVG DIFF" value={stats.averageDifficulty} />
      </section>

      {/* ── Creation panel ─────────────────────────────────────────────────── */}
      <section className="creation-panel" aria-label="Add new mission">
        <div className="creation-panel-header">
          <span className="creation-panel-title">
            <svg className="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            NEW MISSION PARAMETERS
          </span>
        </div>

        <div className="creation-fields">
          {/* Mission name */}
          <div className="field-group field-group--wide">
            <label className="field-label" htmlFor="mission-name">
              MISSION NAME
            </label>
            <input
              id="mission-name"
              className="field-input"
              type="text"
              placeholder="Designate operation…"
              value={missionInput}
              onChange={(e) => setMissionInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </div>

          {/* Objective link — original logic untouched */}
          <div className="field-group">
            <label className="field-label" htmlFor="mission-objective">
              OBJECTIVE LINK
            </label>
            <select
              id="mission-objective"
              className="field-select"
              value={selectedObjective}
              onChange={(e) => setSelectedObjective(e.target.value)}
            >
              <option value="">— None —</option>
              {objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="field-group">
            <label className="field-label" htmlFor="mission-priority">
              PRIORITY
            </label>
            <select
              id="mission-priority"
              className="field-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="field-group">
            <label className="field-label" htmlFor="mission-difficulty">
              DIFFICULTY
            </label>
            <select
              id="mission-difficulty"
              className="field-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Normal">Normal</option>
              <option value="Hard">Hard</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          {/* Category */}
          <div className="field-group">
            <label className="field-label" htmlFor="mission-category">
              CATEGORY
            </label>
            <select
              id="mission-category"
              className="field-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Physical">Physical</option>
              <option value="Mental">Mental</option>
              <option value="Career">Career</option>
              <option value="Learning">Learning</option>
              <option value="Health">Health</option>
            </select>
          </div>
        </div>

        <button
          className="btn-deploy"
          onClick={handleAddMission}
          disabled={!missionInput.trim()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
          DEPLOY MISSION
        </button>
      </section>

      {/* ── Mission list ────────────────────────────────────────────────────── */}
      <section className="mission-list-section" aria-label="Mission list">
        <div className="mission-list-header">
          <h2 className="mission-list-title">ACTIVE OPERATIONS</h2>
          <span className="mission-list-count">
            {missions.length} MISSION{missions.length !== 1 ? "S" : ""} LOGGED
          </span>
        </div>

        {missions.length === 0 ? (
          /* ── Empty state ── */
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="32" cy="32" r="28" strokeDasharray="4 4" />
                <circle cx="32" cy="32" r="16" />
                <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
                <line x1="32" y1="4"  x2="32" y2="16" />
                <line x1="32" y1="48" x2="32" y2="60" />
                <line x1="4"  y1="32" x2="16" y2="32" />
                <line x1="48" y1="32" x2="60" y2="32" />
              </svg>
            </div>
            <p className="empty-state-primary">NO ACTIVE MISSIONS DETECTED</p>
            <p className="empty-state-secondary">
              Create your first mission to begin operation.
            </p>
          </div>
        ) : (
          <div className="mission-grid">
            {missions.map((mission) => {
              // Look up linked objective title for display
              const linkedObj = objectives.find(
                (o) => o.id === mission.objectiveId
              );
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  linkedObjectiveName={linkedObj ? linkedObj.title : null}
                  onComplete={handleCompleteMission}
                  onDelete={handleDeleteMission}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Missions;