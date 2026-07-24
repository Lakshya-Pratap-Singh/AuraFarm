// objectiveCategories.js — Objective Categorization System
//
// Single source of truth for Super Categories + their predefined Objective
// Types, plus the validation helpers used by both the UI (Objectives.jsx)
// and the persistence layer (App.jsx's normalizeObjective).
//
// Storage convention matches the rest of the codebase (see Missions'
// CATEGORY_CONFIG / DIFFICULTY_CONFIG): keys are the human-readable label
// itself, so a stored objective's `superCategory`/`objectiveType` fields are
// directly displayable without a separate lookup table.
//
// Adding a new Super Category or Objective Type only requires editing the
// SUPER_CATEGORY_CONFIG map below — no other file needs to change.

/**
 * @typedef {Object} SuperCategoryDefinition
 * @property {string}   color          - Accent color (hex) used for badges/pills.
 * @property {string}   icon           - Emoji sigil shown next to the label.
 * @property {string[]} objectiveTypes - Predefined Objective Types available under this Super Category.
 */

/**
 * @typedef {Object.<string, SuperCategoryDefinition>} SuperCategoryConfig
 */

/** @type {SuperCategoryConfig} */
export const SUPER_CATEGORY_CONFIG = {
  "Physical Growth": {
    color: "#f97316",
    icon: "💪",
    objectiveTypes: ["Aesthetic Physique", "Lose Fat", "Gain Strength"],
  },
  "Mental Growth": {
    color: "#8b5cf6",
    icon: "🧠",
    objectiveTypes: ["Reading Habit", "Meditation", "Focus"],
  },
  "Career Growth": {
    color: "#eab308",
    icon: "💼",
    objectiveTypes: ["Skill Mastery", "Promotion Track", "Networking"],
  },
  "Financial Growth": {
    color: "#4ade80",
    icon: "💰",
    objectiveTypes: ["Save Money", "Investing", "Debt Free"],
  },
  "Creative Growth": {
    color: "#ec4899",
    icon: "🎨",
    objectiveTypes: ["Writing", "Art & Design", "Music Practice"],
  },
  "Social Growth": {
    color: "#fb923c",
    icon: "🤝",
    objectiveTypes: ["Relationship Building", "Public Speaking", "Community Involvement"],
  },
  "Lifestyle Growth": {
    color: "#e879f9",
    icon: "✨",
    objectiveTypes: ["Sleep Optimization", "Minimalism", "Time Management"],
  },
};

/** Ordered list of Super Category keys, for rendering selects/filters. */
export const SUPER_CATEGORIES = Object.keys(SUPER_CATEGORY_CONFIG);

/**
 * @typedef {Object} Objective
 * @property {number|string} id
 * @property {string}        title
 * @property {number|null}   progress
 * @property {string|null}   targetDate
 * @property {string|null}   superCategory - Must be a key of SUPER_CATEGORY_CONFIG, or null (uncategorized).
 * @property {string|null}   objectiveType - Must be one of superCategory's objectiveTypes, or null.
 * @property {string}        [createdAt]
 */

/**
 * Returns the predefined Objective Types for a given Super Category.
 * @param {string|null|undefined} superCategory
 * @returns {string[]}
 */
export function getObjectiveTypes(superCategory) {
  return SUPER_CATEGORY_CONFIG[superCategory]?.objectiveTypes ?? [];
}

/**
 * @param {*} value
 * @returns {boolean} true if value is a recognized Super Category key.
 */
export function isValidSuperCategory(value) {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SUPER_CATEGORY_CONFIG, value);
}

/**
 * @param {*} superCategory
 * @param {*} objectiveType
 * @returns {boolean} true if objectiveType is a predefined type under superCategory.
 */
export function isValidObjectiveType(superCategory, objectiveType) {
  if (!isValidSuperCategory(superCategory)) return false;
  return typeof objectiveType === "string" && SUPER_CATEGORY_CONFIG[superCategory].objectiveTypes.includes(objectiveType);
}

/**
 * Resolves a (possibly invalid/missing) superCategory + objectiveType pair
 * down to a guaranteed-valid pair, defaulting to `null` (uncategorized)
 * when either value is unrecognized. This is what keeps old objectives
 * (created before this system existed) and hand-edited/corrupt data safe.
 *
 * @param {*} superCategory
 * @param {*} objectiveType
 * @returns {{ superCategory: string|null, objectiveType: string|null }}
 */
export function resolveCategorization(superCategory, objectiveType) {
  const resolvedSuperCategory = isValidSuperCategory(superCategory) ? superCategory : null;
  const resolvedObjectiveType =
    resolvedSuperCategory && isValidObjectiveType(resolvedSuperCategory, objectiveType) ? objectiveType : null;
  return { superCategory: resolvedSuperCategory, objectiveType: resolvedObjectiveType };
}

/** Lookup helper for badge rendering: color for a given (possibly null) Super Category. */
export function getSuperCategoryColor(superCategory) {
  return SUPER_CATEGORY_CONFIG[superCategory]?.color ?? "#5e5571";
}

/** Lookup helper for badge rendering: icon for a given (possibly null) Super Category. */
export function getSuperCategoryIcon(superCategory) {
  return SUPER_CATEGORY_CONFIG[superCategory]?.icon ?? "◇";
}
