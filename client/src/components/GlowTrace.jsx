// GlowTrace — the purple animated border-trace overlay.
// Drop <GlowTrace /> as the last child of any element that also has the
// "glow" class (see index.css for the .glow / .glow-container / .glow-line
// / .glow-blur rules and the --glow-* custom properties each tile can
// override, e.g. --glow-radius for a non-16px border-radius).
export default function GlowTrace() {
  return (
    <svg className="glow-container" aria-hidden="true">
      <rect pathLength="100" strokeLinecap="round" className="glow-blur" />
      <rect pathLength="100" strokeLinecap="round" className="glow-line" />
    </svg>
  );
}