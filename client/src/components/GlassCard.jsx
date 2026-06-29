// GlassCard — base glassmorphism wrapper, theme-aware.
//
// Doesn't hardcode either palette. Reads existing global tokens via CSS
// var() with safe fallbacks, so it drops into both the cyan HUD theme
// (Dashboard/Objectives/Intelligence) and the gold Batcomputer theme
// (Missions) without needing two component implementations.
//
// Usage:
//   <GlassCard theme="cyan">...</GlassCard>
//   <GlassCard theme="gold" className="mission-card">...</GlassCard>

import "../styles/glass-card.css";

function GlassCard({ theme = "cyan", className = "", children, ...rest }) {
  return (
    <div className={`gc-root gc-theme-${theme} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export default GlassCard;