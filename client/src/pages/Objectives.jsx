import { useState } from "react";
import { useBanner, getHeroBackgroundStyle } from "../context/BannerContext.jsx";
import "../styles/objectives-aura.css";

function getObjectiveStats(objectives, missions) {
  const total = objectives.length;
  let complete = 0, progressSum = 0, withMissions = 0;
  objectives.forEach((o) => {
    const related = missions.filter((m) => m.objectiveId === o.id);
    if (!related.length) return;
    withMissions++;
    const pct = Math.round((related.filter((m) => m.completed).length / related.length) * 100);
    progressSum += pct;
    if (pct === 100) complete++;
  });
  return {
    total,
    active: total - complete,
    complete,
    avgProgress: withMissions === 0 ? 0 : Math.round(progressSum / withMissions),
  };
}

function getObjectiveProgress(objective, missions) {
  const related = missions.filter((m) => m.objectiveId === objective.id);
  if (!related.length) return { progress: 0, completed: 0, total: 0 };
  const done = related.filter((m) => m.completed).length;
  return { progress: Math.round((done / related.length) * 100), completed: done, total: related.length };
}

function ObjectiveIcon({ progress }) {
  if (progress === 100) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round"/>
      <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function StatIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ProgressIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function MilestoneIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
}

function Objectives({ objectives, setObjectives, missions }) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const { bannerUrl } = useBanner();

  const handleAdd = () => {
    if (!title.trim()) return;
    setObjectives([...objectives, { id: Date.now(), title, targetDate }]);
    setTitle(""); setTargetDate(""); setShowAdd(false);
  };
  const handleDelete = (id) => setObjectives(objectives.filter((o) => o.id !== id));
  const handleKeyDown = (e) => { if (e.key === "Enter") handleAdd(); };

  const stats = getObjectiveStats(objectives, missions);
  const avgPct = stats.avgProgress;

  return (
    <div className="objectives-page">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="obj-hero" style={getHeroBackgroundStyle(bannerUrl)}>
        <h1 className="obj-hero-heading">Objectives</h1>
        <p className="obj-hero-sub">Long-term goals. Eternal transformation.</p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="obj-stats-grid">
        <div className="obj-stat-card">
          <div className="obj-stat-info">
            <span className="obj-stat-label">Active Objectives</span>
            <span className="obj-stat-value">{stats.active}</span>
            <span className="obj-stat-sub">Keep pushing forward</span>
          </div>
          <div className="obj-stat-icon"><StatIcon /></div>
        </div>
        <div className="obj-stat-card">
          <div className="obj-stat-info">
            <span className="obj-stat-label">Completed</span>
            <span className="obj-stat-value">{stats.complete}</span>
            <span className="obj-stat-sub">Total completed</span>
          </div>
          <div className="obj-stat-icon"><CheckIcon /></div>
        </div>
        <div className="obj-stat-card">
          <div className="obj-stat-info">
            <span className="obj-stat-label">Total Progress</span>
            <span className="obj-stat-value">{avgPct}%</span>
            <span className="obj-stat-sub">Across all objectives</span>
          </div>
          <div className="obj-stat-icon"><ProgressIcon /></div>
        </div>
        <div className="obj-stat-card">
          <div className="obj-stat-info">
            <span className="obj-stat-label">Total Objectives</span>
            <span className="obj-stat-value">{stats.total}</span>
            <span className="obj-stat-sub">All time</span>
          </div>
          <div className="obj-stat-icon"><MilestoneIcon /></div>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="obj-toolbar">
        <span className="obj-section-title">Active Objectives — {objectives.length} logged</span>
        <button className="btn-add-objective" onClick={() => setShowAdd((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          {showAdd ? "Cancel" : "Add Objective"}
        </button>
      </div>

      {/* ── Add panel ───────────────────────────────────────────── */}
      {showAdd && (
        <div className="obj-add-panel">
          <div className="obj-field-group" style={{ gridColumn: "1/-1" }}>
            <label className="obj-field-label" htmlFor="obj-title">Objective Title</label>
            <input id="obj-title" className="obj-field-input" type="text" placeholder="Name your objective…"
              value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={handleKeyDown} autoFocus autoComplete="off"/>
          </div>
          <div className="obj-field-row">
            <div className="obj-field-group">
              <label className="obj-field-label" htmlFor="obj-date">Target Date</label>
              <input id="obj-date" className="obj-field-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}/>
            </div>
          </div>
          <button className="btn-deploy-obj" onClick={handleAdd} disabled={!title.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
            Deploy Objective
          </button>
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────── */}
      {objectives.length === 0 ? (
        <div className="obj-empty-aura">
          <div className="obj-empty-icon">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="32" cy="32" r="28" strokeDasharray="4 4"/>
              <circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <p className="obj-empty-title">No objectives deployed</p>
          <p className="obj-empty-sub">Set your first long-term goal to begin your transformation.</p>
        </div>
      ) : (
        <div className="obj-list-aura">
          {objectives.map((objective) => {
            const { progress, completed: done, total } = getObjectiveProgress(objective, missions);
            const isComplete = progress === 100;
            const dateStr = objective.targetDate
              ? new Date(objective.targetDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : null;

            return (
              <div key={objective.id} className={`obj-card-aura ${isComplete ? "obj-card-aura--complete" : ""}`}>
                <div className="obj-card-icon"><ObjectiveIcon progress={progress} /></div>
                <div className="obj-card-main">
                  <span className="obj-card-title">{objective.title}</span>
                  <div className="obj-card-progress-bar">
                    <div className="obj-card-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="obj-card-meta">
                    {dateStr && (
                      <span className="obj-card-meta-item"><CalendarIcon />{dateStr}</span>
                    )}
                    {total > 0 && (
                      <span className="obj-card-meta-item">{done}/{total} missions</span>
                    )}
                    {total === 0 && (
                      <span className="obj-card-meta-item">No missions linked</span>
                    )}
                  </div>
                </div>
                <div className="obj-card-right">
                  <span className={`obj-card-pct ${isComplete ? "obj-card-pct--complete" : ""}`}>{progress}%</span>
                  <span className="obj-card-missions">{total} mission{total !== 1 ? "s" : ""}</span>
                  <button className="btn-delete-obj" onClick={() => handleDelete(objective.id)} aria-label="Delete objective">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Quote footer ─────────────────────────────────────────── */}
      <div className="obj-quote-banner">
        "Plant the seed of discipline today,<br/>reap the harvest of greatness tomorrow."
      </div>
    </div>
  );
}

export default Objectives;