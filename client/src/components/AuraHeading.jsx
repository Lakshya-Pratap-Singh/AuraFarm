// AuraHeading — logo-style heading system for AuraFarm.
// Three variants matching the spec's H1/H2/H3 treatment:
//   hero    — H1, massive Cinzel gradient + heaviest flame/embers
//   section — H2, smaller Cinzel metallic-silver-purple gradient + light flame
//   sharp   — H3, Orbitron sans (the one place the old sci-fi font stays —
//             spec explicitly calls H3 "sharp angular futuristic", which
//             reads as the sans, not the gothic serif)
//
// Usage:
//   <AuraHeading variant="hero">AuraFarm</AuraHeading>
//   <AuraHeading variant="section">Mission Control</AuraHeading>
//   <AuraHeading variant="sharp" as="h4">Recent Activity</AuraHeading>

import "../styles/aura-heading.css";

const VARIANT_TAG = { hero: "h1", section: "h2", sharp: "h3" };
const EMBER_COUNT = { hero: 6, section: 3, sharp: 0 };

function Embers({ count }) {
  if (!count) return null;
  return (
    <span className="aura-embers" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="aura-ember"
          style={{
            left: `${8 + i * (84 / Math.max(count - 1, 1))}%`,
            animationDelay: `${(i * 0.7) % 4}s`,
          }}
        />
      ))}
    </span>
  );
}

function Flames({ variant }) {
  if (variant === "sharp") return null;
  return (
    <span className="aura-flames" aria-hidden="true">
      <span className="aura-flame aura-flame--a" />
      <span className="aura-flame aura-flame--b" />
      {variant === "hero" && <span className="aura-flame aura-flame--c" />}
    </span>
  );
}

function AuraHeading({ variant = "hero", as, children, className = "" }) {
  const Tag = as || VARIANT_TAG[variant] || "h1";
  const emberCount = EMBER_COUNT[variant] ?? 0;

  return (
    <span className={`aura-heading-wrap aura-heading-wrap--${variant} ${className}`.trim()}>
      <Flames variant={variant} />
      <Embers count={emberCount} />
      <Tag className={`aura-heading aura-heading--${variant}`}>{children}</Tag>
    </span>
  );
}

export default AuraHeading;