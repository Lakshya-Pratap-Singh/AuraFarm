/**
 * AuraFarm — Forge System Configuration
 * ------------------------------------------------
 * Single source of truth for the Objective → Forge hierarchy. Per the
 * "Future Scalability" requirement ("new Forge modules should be addable
 * through configuration rather than major code changes"), controllers,
 * seed scripts, and frontend menus should read FROM this file rather
 * than hardcoding category/type lists.
 *
 * To add a new Forge module (e.g. "Coding Forge") later:
 *   1. Add it to FORGES below.
 *   2. Reference its key in the relevant OBJECTIVE_TYPES autoUnlockForges.
 *   3. Run `node prisma/seed-forges.js` to upsert it into the Forge table.
 * No controller, route, or frontend component code changes required.
 */

const SUPER_CATEGORIES = {
  PHYSICAL: "Physical Growth",
  MENTAL: "Mental Growth",
  CAREER: "Career Growth",
  FINANCIAL: "Financial Growth",
  CREATIVE: "Creative Growth",
  SOCIAL: "Social Growth",
  LIFESTYLE: "Lifestyle Growth"
};

const FORGES = {
  EXERCISE_FORGE: { name: "Exercise Forge", superCategory: "PHYSICAL", icon: "dumbbell" },
  NUTRITION_FORGE: { name: "Nutrition Forge", superCategory: "PHYSICAL", icon: "apple" },
  SLEEP_FORGE: { name: "Sleep Forge", superCategory: "PHYSICAL", icon: "moon" },
  RECOVERY_FORGE: { name: "Recovery Forge", superCategory: "PHYSICAL", icon: "heart-pulse" },

  READING_FORGE: { name: "Reading Forge", superCategory: "MENTAL", icon: "book-open" },
  FOCUS_FORGE: { name: "Focus Forge", superCategory: "MENTAL", icon: "target" },
  NOTE_TAKING_FORGE: { name: "Note Taking Forge", superCategory: "MENTAL", icon: "notebook" },

  CODING_FORGE: { name: "Coding Forge", superCategory: "CAREER", icon: "code" },
  PLACEMENT_FORGE: { name: "Placement Forge", superCategory: "CAREER", icon: "briefcase" },
  COMMUNICATION_FORGE: { name: "Communication Forge", superCategory: "CAREER", icon: "message-circle" }

  // Future modules — uncomment/extend when actually built:
  // WEALTH_FORGE: { name: "Wealth Forge", superCategory: "FINANCIAL", icon: "coins" },
  // MEDITATION_FORGE: { name: "Meditation Forge", superCategory: "MENTAL", icon: "lotus" },
  // CREATOR_FORGE: { name: "Creator Forge", superCategory: "CREATIVE", icon: "palette" },
  // KNOWLEDGE_FORGE: { name: "Knowledge Forge", superCategory: "MENTAL", icon: "brain" },
};

const OBJECTIVE_TYPES = {
  PHYSICAL: {
    AESTHETIC_PHYSIQUE: {
      label: "Build Aesthetic Physique",
      autoUnlockForges: ["EXERCISE_FORGE", "NUTRITION_FORGE", "SLEEP_FORGE", "RECOVERY_FORGE"]
    },
    LOSE_FAT: { label: "Lose Fat", autoUnlockForges: ["EXERCISE_FORGE", "NUTRITION_FORGE"] },
    GAIN_STRENGTH: {
      label: "Gain Strength",
      autoUnlockForges: ["EXERCISE_FORGE", "NUTRITION_FORGE", "RECOVERY_FORGE"]
    },
    IMPROVE_ENDURANCE: { label: "Improve Endurance", autoUnlockForges: ["EXERCISE_FORGE", "RECOVERY_FORGE"] },
    IMPROVE_MOBILITY: { label: "Improve Mobility", autoUnlockForges: ["EXERCISE_FORGE", "RECOVERY_FORGE"] },
    GENERAL_FITNESS: {
      label: "General Fitness",
      autoUnlockForges: ["EXERCISE_FORGE", "NUTRITION_FORGE", "SLEEP_FORGE"]
    }
  },
  MENTAL: {
    READING_HABIT: {
      label: "Reading Habit",
      autoUnlockForges: ["READING_FORGE", "FOCUS_FORGE", "NOTE_TAKING_FORGE"]
    },
    MEDITATION: { label: "Meditation", autoUnlockForges: ["FOCUS_FORGE"] },
    FOCUS_IMPROVEMENT: { label: "Focus Improvement", autoUnlockForges: ["FOCUS_FORGE"] },
    JOURNALING: { label: "Journaling", autoUnlockForges: ["NOTE_TAKING_FORGE"] },
    REDUCE_SCREEN_TIME: { label: "Reduce Screen Time", autoUnlockForges: ["FOCUS_FORGE"] }
  },
  CAREER: {
    LEARN_PROGRAMMING: { label: "Learn Programming", autoUnlockForges: ["CODING_FORGE", "FOCUS_FORGE"] },
    CRACK_PLACEMENTS: {
      label: "Crack Placements",
      autoUnlockForges: ["CODING_FORGE", "PLACEMENT_FORGE", "COMMUNICATION_FORGE", "FOCUS_FORGE"]
    },
    BUILD_PORTFOLIO: { label: "Build Portfolio", autoUnlockForges: ["CODING_FORGE"] },
    LEARN_AI_ML: { label: "Learn AI/ML", autoUnlockForges: ["CODING_FORGE", "FOCUS_FORGE"] }
  },
  FINANCIAL: {},
  CREATIVE: {},
  SOCIAL: {},
  LIFESTYLE: {}
};

const MUSCLE_GROUPS = [
  "CHEST", "BICEPS", "TRICEPS", "SHOULDERS", "BACK",
  "FOREARMS", "ABS", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES"
];

const DIFFICULTY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const FORGE_XP_BY_DIFFICULTY = {
  BEGINNER: 15,
  INTERMEDIATE: 30,
  ADVANCED: 55
};

/**
 * Maps each Forge to the real, existing Mission.category value it should
 * default to when a mission is Forged from one of its resources (see
 * resourceController.js forgeMissionFromResource). These are the ACTUAL
 * category values already used across the frontend's Mission system
 * (Physical/Mental/Career/Learning/Health/Lifestyle/Social/Finance/
 * Spiritual — CATEGORY_CONFIG in Missions.jsx), which is a DIFFERENT,
 * pre-existing taxonomy from the new 7 Super Categories above. Keeping
 * this mapping here (rather than a single hardcoded default in the
 * controller) means adding a new Forge later is still just a config
 * change, not a controller change.
 */
const FORGE_TO_MISSION_CATEGORY = {
  EXERCISE_FORGE: "Physical",
  NUTRITION_FORGE: "Health",
  SLEEP_FORGE: "Health",
  RECOVERY_FORGE: "Health",
  READING_FORGE: "Learning",
  FOCUS_FORGE: "Mental",
  NOTE_TAKING_FORGE: "Learning",
  CODING_FORGE: "Career",
  PLACEMENT_FORGE: "Career",
  // NOTE: the real Mission.category enum only has 5 values (Physical,
  // Mental, Career, Learning, Health) — no "Social", even though the
  // frontend's categoryAssets.js anticipates one (see migration-notes.md
  // for that separate, unresolved discrepancy). Mapped to "Career" since
  // communication/placement skills are career-scoped in the current enum.
  COMMUNICATION_FORGE: "Career"
};

function getObjectiveTypesForSuperCategory(superCategory) {
  return OBJECTIVE_TYPES[superCategory] || {};
}

function getAutoUnlockForges(superCategory, objectiveType) {
  const entry = OBJECTIVE_TYPES[superCategory]?.[objectiveType];
  return entry ? entry.autoUnlockForges : [];
}

export {
  SUPER_CATEGORIES,
  FORGES,
  OBJECTIVE_TYPES,
  MUSCLE_GROUPS,
  DIFFICULTY_LEVELS,
  FORGE_XP_BY_DIFFICULTY,
  FORGE_TO_MISSION_CATEGORY,
  getObjectiveTypesForSuperCategory,
  getAutoUnlockForges
};
