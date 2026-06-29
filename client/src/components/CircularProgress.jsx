// CircularProgress — SVG ring progress indicator.
// Used by ObjectiveCard (objective completion %) and CommandCenterHero
// (could double as the daily completion ring).
//
// Usage:
//   <CircularProgress value={74} size={64} theme="cyan" label="74%" />

import "../styles/circular-progress.css";

function CircularProgress({ value = 0, size = 56, strokeWidth = 5, theme = "cyan", label }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`cp-root cp-theme-${theme}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="cp-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="cp-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="cp-label">{label ?? `${clamped}%`}</span>
    </div>
  );
}

export default CircularProgress;