// AuraButton — the spec's button: neon purple outline, metallic dark
// body, hover = explosion glow + scale 1.05 + energy pulse, active =
// stronger aura. Generic, no app logic — drop it in anywhere a button
// currently exists (DEPLOY MISSION, COMPLETE, etc.) during the
// per-page repaint pass.
//
// Usage:
//   <AuraButton onClick={...}>Deploy Mission</AuraButton>
//   <AuraButton as="a" href="/missions">Go to Missions</AuraButton>

import "../styles/aura-button.css";

function AuraButton({ as = "button", children, className = "", ...rest }) {
  const Tag = as;
  return (
    <Tag className={`aura-btn ${className}`.trim()} {...rest}>
      <span className="aura-btn-label">{children}</span>
    </Tag>
  );
}

export default AuraButton;