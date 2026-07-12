// RelicUnlockOverlay — enhanced celebratory overlay for relic unlocks.
// Animation sequence:
//   0.0s — screen darkens
//   0.2s — purple aura burst
//   0.5s — relic rises with bounce
//   1.0s — glow expands
//   1.3s — rarity text reveals
//   1.8s — name reveal
//   2.2s — description reveal
//   4.0s — auto dismiss
// Legendary: gold + purple energy waves
// Mythic: cosmic vortex + particle ring

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/relics.css";

const RelicUnlockContext = createContext(null);

export function RelicUnlockProvider({ children }) {
  const [pendingRelic, setPendingRelic] = useState(null);

  const triggerRelicUnlock = useCallback((relic) => {
    setPendingRelic(relic);
  }, []);

  const dismiss = useCallback(() => setPendingRelic(null), []);

  return (
    <RelicUnlockContext.Provider value={{ triggerRelicUnlock }}>
      {children}
      <RelicUnlockOverlayInner relic={pendingRelic} onDismiss={dismiss} />
    </RelicUnlockContext.Provider>
  );
}

export function useRelicUnlock() {
  const ctx = useContext(RelicUnlockContext);
  if (!ctx) throw new Error("useRelicUnlock must be used within RelicUnlockProvider");
  return ctx;
}

function RelicUnlockOverlayInner({ relic, onDismiss }) {
  useEffect(() => {
    if (!relic) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [relic, onDismiss]);

  if (!relic) return null;

  const rarity     = relic.rarity || "COMMON";
  const rarityKey  = rarity.toLowerCase();
  const isLegendary = rarity === "LEGENDARY";
  const isMythic    = rarity === "MYTHIC";

  return (
    <AnimatePresence>
      {relic && (
        <motion.div
          className={`relic-unlock-overlay relic-unlock-overlay--${rarityKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onDismiss}
          role="status"
          aria-live="polite"
        >
          {/* Ambient aura burst */}
          <motion.div
            className={`relic-unlock-aura-burst relic-unlock-aura-burst--${rarityKey}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Legendary: energy waves */}
          {isLegendary && (
            <>
              <motion.div className="relic-unlock-wave relic-unlock-wave--1"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.3, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5 }}
              />
              <motion.div className="relic-unlock-wave relic-unlock-wave--2"
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.7, ease: "easeOut", repeat: Infinity, repeatDelay: 0.5 }}
              />
            </>
          )}

          {/* Mythic: orbiting ring + extra burst */}
          {isMythic && (
            <>
              <motion.div className="relic-unlock-orbit-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div className="relic-unlock-orbit-ring relic-unlock-orbit-ring--2"
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="relic-unlock-particle"
                  style={{ "--angle": `${i * 60}deg` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.5 }}
                />
              ))}
            </>
          )}

          {/* Card */}
          <motion.div
            className={`relic-unlock-card relic-unlock-card--${rarityKey}`}
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{    scale: 0.88, opacity: 0        }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Eyebrow */}
            <motion.p
              className="relic-unlock-eyebrow"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              Relic Unlocked
            </motion.p>

            {/* Artwork */}
            <motion.div
              className={`relic-unlock-icon relic-unlock-icon--${rarityKey}`}
              initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotateY: 0,  opacity: 1, scale: 1   }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {relic.icon ? (
                <img
                  src={relic.icon}
                  alt={relic.name}
                  onError={(e) => { e.currentTarget.style.opacity = 0; }}
                />
              ) : (
                <span className="relic-unlock-placeholder" aria-hidden="true">✦</span>
              )}
            </motion.div>

            {/* Rarity badge */}
            <motion.span
              className={`relic-unlock-rarity relic-unlock-rarity--${rarityKey}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1   }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              {rarity}
            </motion.span>

            {/* Name */}
            <motion.p
              className="relic-unlock-name"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              {relic.name}
            </motion.p>

            {/* Description */}
            <motion.p
              className="relic-unlock-desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.5 }}
            >
              {relic.description}
            </motion.p>

            <motion.p
              className="relic-unlock-dismiss"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8, duration: 0.4 }}
            >
              Tap to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RelicUnlockOverlayInner;