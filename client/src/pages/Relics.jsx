// Relics.jsx — AuraFarm Relics page.
// Uses real artwork from src/assets/relics/ via relicAssets.js.
// Architecture: local catalog + computed unlock state from localStorage
// (missions completed count, streak, level, objectives). When a real
// backend exists, replace the `useRelicUnlockState` hook's computation
// with an API call — nothing else in this file needs to change.

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RelicCard from "../components/RelicCard.jsx";
import RelicModal from "../components/RelicModal.jsx";
import { useXP } from "../context/XPContext.jsx";
import { useBanner, getHeroBackgroundStyle } from "../context/BannerContext.jsx";
import { computeStreaks } from "../components/ActivityGrid.jsx";
import { getRelicImage } from "../data/relicAssets.js";
import CategoryBadge from "../components/common/CategoryBadge.jsx";
import "../styles/relics.css";

// ── Full relic catalog — all 18 relics from the spec ────────────────────
const RELIC_CATALOG = [
  // ── COMMON ──────────────────────────────────────────────────
  {
    id: "ember-of-beginning",
    name: "Ember of Beginning",
    description: "The first spark of every journey. Awarded to those who take their first step.",
    rarity: "COMMON",
    category: "DISCIPLINE",
    unlockCondition: "Complete your first mission",
    conditionType: "missions_completed",
    conditionValue: 1,
  },
  {
    id: "seed-of-discipline",
    name: "Seed of Discipline",
    description: "From a single seed grows a forest of habits. Begin the cultivation.",
    rarity: "COMMON",
    category: "CONSISTENCY",
    unlockCondition: "Complete 10 missions",
    conditionType: "missions_completed",
    conditionValue: 10,
  },
  {
    id: "spark-of-consistency",
    name: "Spark of Consistency",
    description: "The universe rewards those who show up every single day.",
    rarity: "COMMON",
    category: "CONSISTENCY",
    unlockCondition: "Maintain a 3-day streak",
    conditionType: "streak",
    conditionValue: 3,
  },
  {
    id: "scroll-of-knowledge",
    name: "Scroll of Knowledge",
    description: "Ancient wisdom passed down to those who seek understanding above all else.",
    rarity: "COMMON",
    category: "GROWTH",
    unlockCondition: "Complete 5 Learning missions",
    conditionType: "learning_missions",
    conditionValue: 5,
  },
  {
    id: "iron-step",
    name: "Iron Step",
    description: "Every step forward, however small, forges the path to greatness.",
    rarity: "COMMON",
    category: "PHYSICAL",
    unlockCondition: "Complete 5 Physical missions",
    conditionType: "physical_missions",
    conditionValue: 5,
  },

  // ── RARE ────────────────────────────────────────────────────
  {
    id: "willpower-emblem",
    name: "Willpower Emblem",
    description: "A symbol carried only by those who refuse to bow to weakness.",
    rarity: "RARE",
    category: "DISCIPLINE",
    unlockCondition: "Maintain a 7-day streak",
    conditionType: "streak",
    conditionValue: 7,
  },
  {
    id: "discipline-blade",
    name: "Discipline Blade",
    description: "Forged from a thousand small acts of resistance. Cut through distraction.",
    rarity: "RARE",
    category: "DISCIPLINE",
    unlockCondition: "Complete 50 missions",
    conditionType: "missions_completed",
    conditionValue: 50,
  },
  {
    id: "mindforge-sigil",
    name: "Mindforge Sigil",
    description: "Burned into the minds of scholars. Knowledge is the sharpest weapon.",
    rarity: "RARE",
    category: "GROWTH",
    unlockCondition: "Complete 25 Learning missions",
    conditionType: "learning_missions",
    conditionValue: 25,
  },
  {
    id: "iron-resolve-crest",
    name: "Iron Resolve Crest",
    description: "Perfect execution. No excuses. No days off. Seven in a row.",
    rarity: "RARE",
    category: "CONSISTENCY",
    unlockCondition: "Complete every mission for 7 consecutive days",
    conditionType: "streak",
    conditionValue: 7,
  },
  {
    id: "aura-lantern",
    name: "Aura Lantern",
    description: "Light the path for those who follow. Your discipline illuminates the way.",
    rarity: "RARE",
    category: "AURA",
    unlockCondition: "Reach Aura Level 5",
    conditionType: "level",
    conditionValue: 5,
  },

  // ── EPIC ────────────────────────────────────────────────────
  {
    id: "book-of-insight",
    name: "Book of Insight",
    description: "Every page turned is a step towards mastery. Every insight earned through sacrifice.",
    rarity: "EPIC",
    category: "GROWTH",
    unlockCondition: "Complete 100 Learning missions",
    conditionType: "learning_missions",
    conditionValue: 100,
  },
  {
    id: "shadows-edge",
    name: "Shadow's Edge",
    description: "The most feared weapon is the one you use on your own limitations.",
    rarity: "EPIC",
    category: "MASTERY",
    unlockCondition: "Maintain a 30-day streak",
    conditionType: "streak",
    conditionValue: 30,
  },
  {
    id: "flame-of-persistence",
    name: "Flame of Persistence",
    description: "It never goes out. No matter the storm, no matter the cost. It burns.",
    rarity: "EPIC",
    category: "DISCIPLINE",
    unlockCondition: "Complete 100 missions",
    conditionType: "missions_completed",
    conditionValue: 100,
  },
  {
    id: "aura-pendant",
    name: "Aura Pendant",
    description: "Your energy radiates outward. Those around you feel your discipline.",
    rarity: "EPIC",
    category: "AURA",
    unlockCondition: "Reach Aura Level 10",
    conditionType: "level",
    conditionValue: 10,
  },
  {
    id: "crystal-vanguard",
    name: "Crystal Vanguard",
    description: "Clear vision. Unbreakable will. You see the path others cannot.",
    rarity: "EPIC",
    category: "MASTERY",
    unlockCondition: "Complete 25 objectives",
    conditionType: "objectives_completed",
    conditionValue: 25,
  },

  // ── LEGENDARY ───────────────────────────────────────────────
  {
    id: "crown-of-discipline",
    name: "Crown of Discipline",
    description: "Not given. Not inherited. Forged through relentless consistency and sacrifice.",
    rarity: "LEGENDARY",
    category: "MASTERY",
    unlockCondition: "Maintain a 100-day streak",
    conditionType: "streak",
    conditionValue: 100,
  },
  {
    id: "obsidian-phoenix",
    name: "Obsidian Phoenix",
    description: "From the ashes of your old self, something terrifying and beautiful rises.",
    rarity: "LEGENDARY",
    category: "ASCENSION",
    unlockCondition: "Recover and rebuild a 30-day streak after breaking one",
    conditionType: "missions_completed",
    conditionValue: 200,
  },
  {
    id: "relic-of-ascension",
    name: "Relic of Ascension",
    description: "The final artifact. Held only by those who have become what they once dreamed of.",
    rarity: "MYTHIC",
    category: "ASCENSION",
    unlockCondition: "Complete all active objectives",
    conditionType: "objectives_completed",
    conditionValue: 10,
  },
];

const RARITY_ORDER = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];

const SECTIONS = [
  { rarity: "COMMON",    label: "Common",    description: "The seeds of greatness." },
  { rarity: "RARE",      label: "Rare",      description: "Earned through consistency." },
  { rarity: "EPIC",      label: "Epic",      description: "Forged through mastery." },
  { rarity: "LEGENDARY", label: "Legendary", description: "Reserved for the elite." },
  { rarity: "MYTHIC",    label: "Mythic",    description: "Beyond mortal expectation." },
];

// ── Compute unlock state from localStorage ───────────────────────────────
function useRelicUnlockState() {
  const { level } = useXP();

  return useMemo(() => {
    // Pull raw counts from localStorage
    let missionsCompleted = 0;
    let learningMissions  = 0;
    let physicalMissions  = 0;
    let objectivesCompleted = 0;
    let streak = 0;

    try {
      // Missions
      const missionsRaw = localStorage.getItem("missions");
      if (missionsRaw) {
        const missions = JSON.parse(missionsRaw);
        if (Array.isArray(missions)) {
          missionsCompleted = missions.filter(m => m.completed).length;
          learningMissions  = missions.filter(m => m.completed && m.category === "Learning").length;
          physicalMissions  = missions.filter(m => m.completed && m.category === "Physical").length;
        }
      }
      // Objectives
      const objectivesRaw = localStorage.getItem("objectives");
      if (objectivesRaw) {
        const objectives = JSON.parse(objectivesRaw);
        if (Array.isArray(objectives)) {
          objectivesCompleted = objectives.filter(o => o.completed).length;
        }
      }
      // Streak — from daily-snapshots (same as ActivityGrid)
      const snapRaw = localStorage.getItem("daily-snapshots");
      if (snapRaw) {
        const days = JSON.parse(snapRaw);
        const { current } = computeStreaks(days);
        streak = current;
      }
    } catch {
      // Silently degrade — unlock state just shows 0 progress
    }

    // Compute progress & unlocked status for each relic
    const stateMap = {};
    for (const relic of RELIC_CATALOG) {
      let progress = 0;
      let current  = 0;
      const target = relic.conditionValue;

      switch (relic.conditionType) {
        case "missions_completed":    current = missionsCompleted;   break;
        case "learning_missions":     current = learningMissions;    break;
        case "physical_missions":     current = physicalMissions;    break;
        case "objectives_completed":  current = objectivesCompleted; break;
        case "streak":                current = streak;              break;
        case "level":                 current = level;               break;
        default:                      current = 0;
      }

      progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
      const unlocked = current >= target;

      stateMap[relic.id] = { unlocked, progress, current, target };
    }

    return stateMap;
  }, [level]);
}

function Relics({ missions = [], objectives = [] }) {
  const unlockState = useRelicUnlockState();
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL | UNLOCKED | LOCKED
  const { bannerUrl } = useBanner();

  // Enrich catalog with images + live unlock state
  const enrichedRelics = useMemo(() =>
    RELIC_CATALOG.map(relic => ({
      ...relic,
      icon: getRelicImage(relic.id),
      unlocked:   unlockState[relic.id]?.unlocked  ?? false,
      progress:   unlockState[relic.id]?.progress  ?? 0,
      current:    unlockState[relic.id]?.current   ?? 0,
      unlockedAt: unlockState[relic.id]?.unlocked  ? new Date().toISOString() : null,
    })),
    [unlockState]
  );

  const filteredRelics = useMemo(() => {
    if (filter === "UNLOCKED") return enrichedRelics.filter(r => r.unlocked);
    if (filter === "LOCKED")   return enrichedRelics.filter(r => !r.unlocked);
    return enrichedRelics;
  }, [enrichedRelics, filter]);

  const byRarity = useMemo(() => {
    const map = {};
    RARITY_ORDER.forEach(r => { map[r] = []; });
    filteredRelics.forEach(relic => {
      if (map[relic.rarity]) map[relic.rarity].push(relic);
    });
    return map;
  }, [filteredRelics]);

  const totalUnlocked   = enrichedRelics.filter(r => r.unlocked).length;
  const totalRelics     = enrichedRelics.length;
  const completionPct   = totalRelics > 0 ? Math.round((totalUnlocked / totalRelics) * 100) : 0;
  const legendaryCount  = enrichedRelics.filter(r => r.unlocked && (r.rarity === "LEGENDARY" || r.rarity === "MYTHIC")).length;

  return (
    <div className="relics-page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relics-hero" style={getHeroBackgroundStyle(bannerUrl)}>
        <h1 className="relics-hero-heading">Relics</h1>
        <p className="relics-hero-sub">Ancient artifacts. Earned through discipline, consistency, and mastery.</p>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <div className="relics-stats-bar">
        <div className="relics-stat">
          <span className="relics-stat-value">{totalUnlocked}</span>
          <span className="relics-stat-label">Relics Collected</span>
        </div>
        <div className="relics-stat">
          <span className="relics-stat-value">{totalRelics - totalUnlocked}</span>
          <span className="relics-stat-label">Still Locked</span>
        </div>
        <div className="relics-stat">
          <span className="relics-stat-value">{completionPct}%</span>
          <span className="relics-stat-label">Collection Progress</span>
        </div>
        <div className="relics-stat">
          <span className="relics-stat-value">{legendaryCount}</span>
          <span className="relics-stat-label">Legendary+</span>
        </div>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────── */}
      <div className="relics-filters">
        {["ALL", "UNLOCKED", "LOCKED"].map(f => (
          <button
            key={f}
            className={`relics-filter-btn ${filter === f ? "relics-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? `All (${totalRelics})` :
             f === "UNLOCKED" ? `Unlocked (${totalUnlocked})` :
             `Locked (${totalRelics - totalUnlocked})`}
          </button>
        ))}
      </div>

      {/* ── Rarity sections ───────────────────────────────────── */}
      <div className="relics-body">
        {SECTIONS.map(({ rarity, label }) => {
          const sectionRelics = byRarity[rarity] || [];
          if (sectionRelics.length === 0) return null;
          const rarityKey = rarity.toLowerCase();
          const unlockedInSection = enrichedRelics.filter(r => r.rarity === rarity && r.unlocked).length;
          const totalInSection    = enrichedRelics.filter(r => r.rarity === rarity).length;

          return (
            <motion.section
              key={rarity}
              className="relics-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relics-section-header">
                <span className={`relics-section-title relics-section-title--${rarityKey}`}>
                  {label}
                </span>
                <div className={`relics-section-line relics-section-line--${rarityKey}`} />
                <span className="relics-section-count">
                  {unlockedInSection}/{totalInSection}
                </span>
              </div>

              <div className="relics-grid">
                {sectionRelics.map((relic, i) => (
                  <motion.div
                    key={relic.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <RelicCard relic={relic} onClick={setSelectedRelic} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* ── Detail modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedRelic && (
          <RelicModal relic={selectedRelic} onClose={() => setSelectedRelic(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Relics;