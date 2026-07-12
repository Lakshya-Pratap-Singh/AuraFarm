// RelicModal — full detail view for a relic with real artwork + rarity aura.

import { motion, AnimatePresence } from "framer-motion";
import CategoryBadge from "./common/CategoryBadge.jsx";
import "../styles/relics.css";

const RARITY_LABEL = {
  COMMON:    "Common Artifact",
  RARE:      "Rare Artifact",
  EPIC:      "Epic Artifact",
  LEGENDARY: "Legendary Artifact",
  MYTHIC:    "Mythic Artifact",
};

const RARITY_XP = {
  COMMON: "+50 XP Aura",
  RARE: "+150 XP Aura",
  EPIC: "+350 XP Aura",
  LEGENDARY: "+750 XP Aura",
  MYTHIC: "+1500 XP Aura",
};

function RelicModal({ relic, onClose }) {
  if (!relic) return null;
  const rarityKey   = relic.rarity.toLowerCase();
  const rarityClass = `relic-modal--${rarityKey}`;
  const isLocked    = !relic.unlocked;

  return (
    <motion.div
      className="relic-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className={`relic-modal ${rarityClass}`}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="relic-modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Artwork */}
        <div className={`relic-modal-icon ${isLocked ? "relic-modal-icon--locked" : ""}`}>
          {relic.icon ? (
            <img
              src={relic.icon}
              alt={relic.name}
              className={isLocked ? "relic-modal-img--locked" : ""}
              onError={(e) => { e.currentTarget.style.opacity = 0; }}
            />
          ) : (
            <span className="relic-modal-placeholder" aria-hidden="true">✦</span>
          )}
          {/* Rarity aura ring behind the artwork */}
          {!isLocked && <div className={`relic-modal-aura-ring relic-modal-aura-ring--${rarityKey}`} />}
        </div>

        {/* Rarity pill */}
        <span className="relic-modal-rarity">
          {RARITY_LABEL[relic.rarity] || relic.rarity}
        </span>

        {/* Name */}
        <h2 className="relic-modal-name">{relic.name}</h2>

        {/* Description */}
        <p className="relic-modal-desc">{relic.description}</p>

        {/* Metadata */}
        <div className="relic-modal-meta">
          <div className="relic-modal-meta-row">
            <span className="relic-modal-meta-label">Category</span>
            <span className="relic-modal-meta-value"><CategoryBadge category={relic.category} size="xs" /></span>
          </div>
          <div className="relic-modal-meta-row">
            <span className="relic-modal-meta-label">Condition</span>
            <span className="relic-modal-meta-value">{relic.unlockCondition}</span>
          </div>
          {/* Progress bar (locked relics) */}
          {isLocked && relic.target > 0 && (
            <div className="relic-modal-meta-row">
              <span className="relic-modal-meta-label">Progress</span>
              <span className="relic-modal-meta-value">
                {relic.current ?? 0} / {relic.target} ({relic.progress ?? 0}%)
              </span>
            </div>
          )}
          <div className="relic-modal-meta-row">
            <span className="relic-modal-meta-label">Status</span>
            <span className={`relic-modal-meta-value ${relic.unlocked ? "relic-modal-meta-value--unlocked" : "relic-modal-meta-value--locked"}`}>
              {relic.unlocked ? "✓ Unlocked" : "Locked"}
            </span>
          </div>
          {relic.unlocked && (
            <div className="relic-modal-meta-row">
              <span className="relic-modal-meta-label">Aura Bonus</span>
              <span className="relic-modal-meta-value" style={{ color: "#a855f7" }}>
                {RARITY_XP[relic.rarity] || "+XP"}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RelicModal;