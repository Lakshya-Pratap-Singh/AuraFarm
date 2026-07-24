/**
 * MuscleMapFallback
 * ------------------------------------------------
 * 2D equivalent of InteractiveBody3D for devices that fail the
 * useDeviceCapability() check (no WebGL, reduced-motion preference, or
 * low-end hardware heuristics). Same props interface as the 3D
 * component, so ExerciseForge.jsx can swap between them with zero
 * conditional logic beyond which one to mount.
 *
 * The regions below are intentionally simple front/back body outlines
 * with clickable <ellipse> regions per muscle group — a real
 * illustration (traced from actual anatomy art) is a design asset
 * swap-in, not a code change, since selection is by `data-muscle` key,
 * not by shape.
 */
import { useState } from "react";

const REGIONS_FRONT = [
  { key: "SHOULDERS", label: "Shoulders", cx: 30, cy: 42, rx: 10, ry: 8 },
  { key: "SHOULDERS", label: "Shoulders", cx: 90, cy: 42, rx: 10, ry: 8 },
  { key: "CHEST", label: "Chest", cx: 60, cy: 55, rx: 20, ry: 14 },
  { key: "BICEPS", label: "Biceps", cx: 24, cy: 65, rx: 7, ry: 14 },
  { key: "BICEPS", label: "Biceps", cx: 96, cy: 65, rx: 7, ry: 14 },
  { key: "ABS", label: "Abs", cx: 60, cy: 85, rx: 15, ry: 18 },
  { key: "FOREARMS", label: "Forearms", cx: 20, cy: 95, rx: 6, ry: 14 },
  { key: "FOREARMS", label: "Forearms", cx: 100, cy: 95, rx: 6, ry: 14 },
  { key: "QUADS", label: "Quads", cx: 48, cy: 140, rx: 12, ry: 22 },
  { key: "QUADS", label: "Quads", cx: 72, cy: 140, rx: 12, ry: 22 },
  { key: "CALVES", label: "Calves", cx: 48, cy: 195, rx: 8, ry: 16 },
  { key: "CALVES", label: "Calves", cx: 72, cy: 195, rx: 8, ry: 16 }
];

const REGIONS_BACK = [
  { key: "BACK", label: "Back", cx: 60, cy: 55, rx: 20, ry: 20 },
  { key: "TRICEPS", label: "Triceps", cx: 24, cy: 68, rx: 7, ry: 14 },
  { key: "TRICEPS", label: "Triceps", cx: 96, cy: 68, rx: 7, ry: 14 },
  { key: "GLUTES", label: "Glutes", cx: 60, cy: 108, rx: 16, ry: 12 },
  { key: "HAMSTRINGS", label: "Hamstrings", cx: 48, cy: 145, rx: 11, ry: 20 },
  { key: "HAMSTRINGS", label: "Hamstrings", cx: 72, cy: 145, rx: 11, ry: 20 }
];

function RegionSet({ regions, selectedMuscle, hovered, setHovered, onSelectMuscle }) {
  return regions.map((r, i) => {
    const isSelected = selectedMuscle === r.key;
    const isHovered = hovered === r.key;
    return (
      <ellipse
        key={`${r.key}-${i}`}
        cx={r.cx}
        cy={r.cy}
        rx={r.rx}
        ry={r.ry}
        className="muscle-region"
        data-selected={isSelected}
        data-hovered={isHovered}
        onClick={() => onSelectMuscle(r.key)}
        onMouseEnter={() => setHovered(r.key)}
        onMouseLeave={() => setHovered(null)}
        onTouchStart={() => onSelectMuscle(r.key)}
      >
        <title>{r.label}</title>
      </ellipse>
    );
  });
}

export default function MuscleMapFallback({ selectedMuscle, onSelectMuscle }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="muscle-map-fallback">
      <div className="muscle-map-view">
        <div className="muscle-map-view-label">Front</div>
        <svg viewBox="0 0 120 220" className="muscle-map-svg">
          <ellipse cx="60" cy="20" rx="12" ry="14" className="body-outline" />
          <path d="M40 30 Q60 25 80 30 L85 150 Q60 165 35 150 Z" className="body-outline" />
          <RegionSet
            regions={REGIONS_FRONT}
            selectedMuscle={selectedMuscle}
            hovered={hovered}
            setHovered={setHovered}
            onSelectMuscle={onSelectMuscle}
          />
        </svg>
      </div>
      <div className="muscle-map-view">
        <div className="muscle-map-view-label">Back</div>
        <svg viewBox="0 0 120 220" className="muscle-map-svg">
          <ellipse cx="60" cy="20" rx="12" ry="14" className="body-outline" />
          <path d="M40 30 Q60 25 80 30 L85 150 Q60 165 35 150 Z" className="body-outline" />
          <RegionSet
            regions={REGIONS_BACK}
            selectedMuscle={selectedMuscle}
            hovered={hovered}
            setHovered={setHovered}
            onSelectMuscle={onSelectMuscle}
          />
        </svg>
      </div>
    </div>
  );
}
