import { useState } from "react";
import ObjectiveCard from "../components/ObjectiveCard.jsx";
import "../styles/objectives.css";

// ── Derived stats — same per-objective progress calc ObjectiveCard
// uses, kept local rather than shared, matching how Dashboard.jsx and
// Missions.jsx each keep their own derived-stat helpers self-contained
// instead of importing from a shared utils module. ──────────────────
function getObjectiveStats(objectives, missions) {
  const total = objectives.length;

  let complete = 0;
  let progressSum = 0;
  let withMissions = 0;

  objectives.forEach((objective) => {
    const related = missions.filter((m) => m.objectiveId === objective.id);
    if (related.length === 0) return;

    withMissions += 1;
    const completedCount = related.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / related.length) * 100);
    progressSum += progress;
    if (progress === 100) complete += 1;
  });

  const active = total - complete;
  const avgProgress = withMissions === 0 ? 0 : Math.round(progressSum / withMissions);

  return { total, active, complete, avgProgress };
}

function StatTile({ label, value, accent }) {
  return (
    <div className={`obj-stat-tile ${accent ? "obj-stat-tile--accent" : ""}`}>
      <span className="obj-stat-tile-value">{value}</span>
      <span className="obj-stat-tile-label">{label}</span>
    </div>
  );
}

function Objectives({ objectives, setObjectives, missions }) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // ── CRUD handlers (original logic preserved exactly) ──
  const handleAddObjective = () => {
    if (!title.trim()) return;

    const newObjective = {
      id: Date.now(),
      title,
      targetDate,
    };

    setObjectives([...objectives, newObjective]);

    setTitle("");
    setTargetDate("");
  };

  const handleDeleteObjective = (id) => {
    const updatedObjectives = objectives.filter(
      (objective) => objective.id !== id
    );

    setObjectives(updatedObjectives);
  };

  // Allow Enter key to submit from the title field, matching Missions.jsx
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddObjective();
  };

  const stats = getObjectiveStats(objectives, missions);

  return (
    <div className="objectives-page">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="objectives-header">
        <div className="objectives-header-title">
          <span className="objectives-header-eyebrow">DAILYWISE // STRATEGIC OPS</span>
          <h1 className="objectives-heading">OBJECTIVE MATRIX</h1>
        </div>
        <div className="objectives-header-badge">
          <span className="objectives-header-badge-dot" />
          SYSTEM ONLINE
        </div>
      </header>

      {/* ── Overview bar ─────────────────────────────────────────────── */}
      <section className="obj-overview-bar" aria-label="Objective statistics">
        <StatTile label="TOTAL OBJECTIVES" value={stats.total} accent />
        <div className="obj-overview-divider" />
        <StatTile label="ACTIVE" value={stats.active} />
        <div className="obj-overview-divider" />
        <StatTile label="COMPLETE" value={stats.complete} />
        <div className="obj-overview-divider" />
        <StatTile label="AVG PROGRESS" value={`${stats.avgProgress}%`} />
      </section>

      {/* ── Creation panel ───────────────────────────────────────────── */}
      <section className="obj-creation-panel" aria-label="Add new objective">
        <div className="obj-creation-panel-header">
          <span className="obj-creation-panel-title">
            <svg className="obj-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            NEW OBJECTIVE PARAMETERS
          </span>
        </div>

        <div className="obj-creation-fields">
          <div className="obj-field-group obj-field-group--wide">
            <label className="obj-field-label" htmlFor="objective-title">
              OBJECTIVE TITLE
            </label>
            <input
              id="objective-title"
              className="obj-field-input"
              type="text"
              placeholder="Designate objective…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </div>

          <div className="obj-field-group">
            <label className="obj-field-label" htmlFor="objective-date">
              TARGET DATE
            </label>
            <input
              id="objective-date"
              className="obj-field-input"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        <button
          className="obj-btn-deploy"
          onClick={handleAddObjective}
          disabled={!title.trim()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
          DEPLOY OBJECTIVE
        </button>
      </section>

      {/* ── Objective list ───────────────────────────────────────────── */}
      <section className="obj-list-section" aria-label="Objective list">
        <div className="obj-list-header">
          <h2 className="obj-list-title">ACTIVE OBJECTIVES</h2>
          <span className="obj-list-count">
            {objectives.length} OBJECTIVE{objectives.length !== 1 ? "S" : ""} LOGGED
          </span>
        </div>

        {objectives.length === 0 ? (
          <div className="obj-empty-state">
            <div className="obj-empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="32" cy="32" r="28" strokeDasharray="4 4" />
                <circle cx="32" cy="32" r="16" />
                <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
                <line x1="32" y1="4" x2="32" y2="16" />
                <line x1="32" y1="48" x2="32" y2="60" />
                <line x1="4" y1="32" x2="16" y2="32" />
                <line x1="48" y1="32" x2="60" y2="32" />
              </svg>
            </div>
            <p className="obj-empty-state-primary">NO OBJECTIVES DETECTED</p>
            <p className="obj-empty-state-secondary">
              Create your first objective to begin strategic planning.
            </p>
          </div>
        ) : (
          <div className="obj-grid">
            {objectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                missions={missions}
                onDelete={handleDeleteObjective}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Objectives;