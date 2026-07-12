// categoryAssets.js
// Single source of truth for category SVG artwork.
//
// HOW TO UPDATE:
//   1. Drop your new SVG into src/assets/categories/<name>.svg
//   2. That's it — no code changes needed.
//      Vite resolves imports at build time; replacing the file on disk
//      automatically picks up the new artwork everywhere in the app.
//
// Each entry exports:
//   src      — resolved URL string (use as <img src={src}> or url(...))
//   color    — brand accent color for glows, borders, backgrounds
//   label    — display label (uppercased)

import physicalSvg    from "../assets/categories/physical.png";
import mentalSvg      from "../assets/categories/mental.png";
import careerSvg      from "../assets/categories/career.png";
import learningSvg    from "../assets/categories/learning.png";
import healthSvg      from "../assets/categories/health.png";
import lifestyleSvg   from "../assets/categories/lifestyle.png";
import socialSvg      from "../assets/categories/social.png";
import financeSvg     from "../assets/categories/finance.png";
import spiritualSvg   from "../assets/categories/spiritual.png";
import productivitySvg from "../assets/categories/productivity.png";
import othersSvg      from "../assets/categories/others.png";

// ─── Asset map ────────────────────────────────────────────────────────────
// Keys are lowercase category strings exactly as stored on mission objects.
// The `color` values mirror CATEGORY_CONFIG in Missions.jsx — keep in sync.

export const CATEGORY_ASSETS = {
  physical:     { src: physicalSvg,     color: "#f97316", label: "PHYSICAL"     },
  mental:       { src: mentalSvg,       color: "#8b5cf6", label: "MENTAL"       },
  career:       { src: careerSvg,       color: "#eab308", label: "CAREER"       },
  learning:     { src: learningSvg,     color: "#38bdf8", label: "LEARNING"     },
  health:       { src: healthSvg,       color: "#22c55e", label: "HEALTH"       },
  lifestyle:    { src: lifestyleSvg,    color: "#e879f9", label: "LIFESTYLE"    },
  social:       { src: socialSvg,       color: "#fb923c", label: "SOCIAL"       },
  finance:      { src: financeSvg,      color: "#4ade80", label: "FINANCE"      },
  spiritual:    { src: spiritualSvg,    color: "#c084fc", label: "SPIRITUAL"    },
  productivity: { src: productivitySvg, color: "#facc15", label: "PRODUCTIVITY" },
  creativity:   { src: othersSvg,       color: "#f472b6", label: "CREATIVITY"   },
  others:       { src: othersSvg,       color: "#94a3b8", label: "OTHERS"       },
};

// Fallback for unknown categories — uses "others" sigil + muted color
export const CATEGORY_FALLBACK = CATEGORY_ASSETS.others;

/**
 * getCategoryAsset(category)
 * Returns the asset entry for the given category string (case-insensitive).
 * Always returns a valid object — never undefined, never crashes.
 *
 * @param {string} category — e.g. "Physical", "LEARNING", "finance"
 * @returns {{ src: string, color: string, label: string }}
 */
export function getCategoryAsset(category) {
  if (!category) return CATEGORY_FALLBACK;
  return CATEGORY_ASSETS[category.toLowerCase()] ?? CATEGORY_FALLBACK;
}