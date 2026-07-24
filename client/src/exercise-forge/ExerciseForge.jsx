import { useState, useEffect } from "react";
import { useDeviceCapability } from "./useDeviceCapability.js";
import InteractiveBody3D from "./InteractiveBody3D.jsx";
import MuscleMapFallback from "./MuscleMapFallback.jsx";
import "./ExerciseForge.css";

/**
 * ExerciseForge — top-level page component.
 *
 * Wiring notes for integration:
 *   - Expects a `fetchResources(muscleGroup, filters)` prop (swap for
 *     your existing data-fetching convention — React Query, SWR, a
 *     custom hook, whatever this repo already uses; taken as a prop
 *     rather than assumed since I don't have visibility into that layer).
 *   - `onForgeMission(resource)` should call
 *     `POST /api/v1/resources/:id/forge-mission`.
 *   - `onSaveResource(resource)` should call
 *     `POST /api/v1/resources/:id/save`.
 */
export default function ExerciseForge({
  fetchResources,
  onSaveResource,
  onForgeMission,
  onAddToObjective
}) {
  const capability = useDeviceCapability();
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedMuscle || !fetchResources) return;
    let cancelled = false;
    setLoading(true);
    fetchResources(selectedMuscle, { difficulty: difficultyFilter })
      .then((data) => {
        if (!cancelled) setResources(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedMuscle, difficultyFilter, fetchResources]);

  return (
    <div className="exercise-forge">
      <div className="exercise-forge-header">
        <h1 className="exercise-forge-title">Exercise Forge</h1>
        <p className="exercise-forge-sub">
          {selectedMuscle
            ? `Showing resources for ${selectedMuscle.toLowerCase()}`
            : "Select a muscle group to see exercises"}
        </p>
      </div>

      <div className="exercise-forge-body">
        {capability === "checking" && (
          <div className="exercise-forge-loading">Loading body model…</div>
        )}

        {capability === "3d" && (
          <InteractiveBody3D selectedMuscle={selectedMuscle} onSelectMuscle={setSelectedMuscle} />
        )}

        {capability === "2d" && (
          <MuscleMapFallback selectedMuscle={selectedMuscle} onSelectMuscle={setSelectedMuscle} />
        )}

        {selectedMuscle && (
          <div className="muscle-resource-panel">
            <div className="filter-row">
              {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level) => (
                <button
                  key={level}
                  className={`filter-chip ${difficultyFilter === level ? "active" : ""}`}
                  onClick={() => setDifficultyFilter(difficultyFilter === level ? null : level)}
                >
                  {level[0] + level.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {loading && <div className="exercise-forge-loading">Loading resources…</div>}

            <div className="resource-card-grid">
              {resources.map((resource) => (
                <div className="resource-card" key={resource.id}>
                  {resource.gifUrl && (
                    <img src={resource.gifUrl} alt={resource.title} className="resource-card-media" />
                  )}
                  <div className="resource-card-title">{resource.title}</div>
                  <div className="resource-card-meta">
                    <span className="resource-card-difficulty">{resource.difficulty}</span>
                    {resource.equipment && (
                      <span className="resource-card-equipment">{resource.equipment}</span>
                    )}
                  </div>
                  <p className="resource-card-description">{resource.description}</p>
                  <div className="resource-card-actions">
                    <button onClick={() => onSaveResource?.(resource)}>⭐ Save</button>
                    <button onClick={() => window.open(resource.videoUrl || resource.externalUrl, "_blank")}>
                      📖 Learn
                    </button>
                    <button onClick={() => onForgeMission?.(resource)}>⚔ Forge Mission</button>
                    <button onClick={() => onAddToObjective?.(resource)}>🔥 Add To Objective</button>
                  </div>
                </div>
              ))}
              {!loading && resources.length === 0 && (
                <div className="resource-empty-state">No resources yet for this muscle group.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
