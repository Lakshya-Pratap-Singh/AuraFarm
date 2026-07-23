// CategoryBadge — renders the category SVG sigil + optional label.
//
// Sizes:
//   xs  — 14px sigil only (filter pills, inline text badges)
//   sm  — 18px sigil + small label (mission card badges, dropdowns)
//   md  — 24px sigil + label  (section headers, mission forms)
//   lg  — 65px sigil + label  (Dashboard's compact mission row, ~73px tall)
//   xl  — 80px sigil + label  (Missions page's mission row, ~89px tall)
//
// The SVG is loaded as a regular <img> so Vite's asset pipeline handles
// it at build time. Replacing the SVG file on disk is all that's needed
// to update the artwork everywhere — no code changes required.
//
// Usage:
//   <CategoryBadge category="physical" />
//   <CategoryBadge category="Learning" size="lg" />
//   <CategoryBadge category="FINANCE"  size="xs" showLabel={false} />
//   <CategoryBadge category="Learning" size="xs" showIcon={false} />  — text-only badge

import { getCategoryAsset } from "../../data/categoryAssets.js";
import "./CategoryBadge.css";

const SIZE_MAP = {
  xs: { img: 14, fontSize: "8.5px",  gap: "4px",  padding: "2px 6px"  },
  sm: { img: 16, fontSize: "9.5px",  gap: "5px",  padding: "3px 8px"  },
  md: { img: 24, fontSize: "11px",   gap: "6px",  padding: "6px 12px" },
  lg: { img: 65, fontSize: "12.5px", gap: "8px",  padding: "8px 14px" },
  xl: { img: 80, fontSize: "13px",   gap: "9px",  padding: "9px 16px" },
};

function CategoryBadge({
  category,
  size        = "sm",
  showLabel   = true,
  showIcon    = true,
  className   = "",
  onClick,
}) {
  const asset = getCategoryAsset(category);
  const sz    = SIZE_MAP[size] ?? SIZE_MAP.sm;

  return (
    <span
      className={`cat-badge cat-badge--${size} ${className}`.trim()}
      onClick={onClick}
      style={{
        "--cat-color":   asset.color,
        "--cat-bg":      asset.color + "18",
        "--cat-border":  asset.color + "44",
        gap:             sz.gap,
        padding:         showLabel ? sz.padding : `${parseInt(sz.padding) * 0.8}px`,
        cursor:          onClick ? "pointer" : "default",
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(e); } : undefined}
      aria-label={`Category: ${asset.label}`}
    >
      {showIcon && (
        <img
          src={asset.src}
          alt=""
          aria-hidden="true"
          className="cat-badge-sigil"
          width={sz.img}
          height={sz.img}
          style={{
            width:  sz.img,
            height: sz.img,
            filter: `drop-shadow(0 0 3px ${asset.color}88)`,
          }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      {showLabel && (
        <span
          className="cat-badge-label"
          style={{ fontSize: sz.fontSize, color: asset.color }}
        >
          {asset.label}
        </span>
      )}
    </span>
  );
}

export default CategoryBadge;