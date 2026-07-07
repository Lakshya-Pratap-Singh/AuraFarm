// AuraLogoMark — the real AuraFarm monogram artwork (angular A merged
// with F inside a glowing circular rune), cropped to just the icon mark
// from the full lockup and exported as a transparent PNG so it drops
// cleanly onto any dark surface (sidebar, login card, etc.).
//
// Previously this was a hand-coded SVG approximation; now that we have
// the actual artwork, every consumer of this component picks it up
// automatically — no call sites needed to change.
//
// Usage:
//   <AuraLogoMark size={32} />

import "../styles/aura-logomark.css";
import auraMark from "../assets/aurafarm-mark.png";

function AuraLogoMark({ size = 32, className = "" }) {
  return (
    <img
      src={auraMark}
      alt="AuraFarm"
      className={`aura-logomark ${className}`.trim()}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      draggable="false"
    />
  );
}

export default AuraLogoMark;