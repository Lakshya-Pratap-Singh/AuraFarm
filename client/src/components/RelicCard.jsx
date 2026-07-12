// RelicCard — relic display card with real artwork and progress bar.
// Locked relics show artwork silhouette + progress toward unlock.
// Unlocked relics show full artwork with rarity glow.

import { motion } from "framer-motion";
import "../styles/relics.css";

function RelicCard({ relic, onClick }) {
  const rarityClass = `relic-card--${relic.rarity.toLowerCase()}`;
  const isLocked    = !relic.unlocked;
  const progress    = relic.progress ?? 0;
  const current     = relic.current  ?? 0;
  const target      = relic.target   ?? relic.conditionValue ?? 1;

  return (
    <motion.article
      className={`relic-card ${rarityClass} ${isLocked ? "relic-card--locked" : ""}`}
      onClick={() => onClick(relic)}
      whileHover={!isLocked ? { scale: 1.05, y: -4 } : { scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isLocked ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(relic); }}
      aria-label={isLocked ? `${relic.name} — locked, ${progress}% progress` : relic.name}
    >
      {/* Icon */}
      <div className="relic-card-icon">
        {relic.icon ? (
          <img
            src={relic.icon}
            alt={relic.name}
            className={isLocked ? "relic-card-img--locked" : ""}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="relic-card-placeholder" aria-hidden="true">✦</span>
        )}
        {isLocked && (
          <span className="relic-card-lock" aria-hidden="true">🔒</span>
        )}
      </div>

      {/* Name */}
      <span className="relic-card-name">
        {isLocked ? (progress > 0 ? relic.name : "???") : relic.name}
      </span>

      {/* Rarity badge */}
      <span className="relic-card-rarity">{relic.rarity}</span>

      {/* Progress bar — only for locked relics with measurable progress */}
      {isLocked && target > 0 && (
        <div className="relic-card-progress">
          <div
            className="relic-card-progress-fill"
            style={{ width: `${progress}%` }}
          />
          <span className="relic-card-progress-label">
            {current}/{target}
          </span>
        </div>
      )}
    </motion.article>
  );
}

export default RelicCard;