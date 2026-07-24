// muscleGroups.js — centralized Muscle Group configuration for Exercise Forge.
//
// Same convention as data/objectiveCategories.js and data/resourceMappings.js:
// one declarative config object is the single source of truth for identity
// (label/icon/color) so nothing gets hardcoded inside ExerciseForge.jsx or
// any other component. Add a muscle group here and it shows up everywhere
// automatically.

/**
 * @typedef {Object} MuscleGroupDefinition
 * @property {string} icon  - Emoji sigil shown on the muscle card.
 * @property {string} color - Accent color (hex) for the card/badge.
 */

/** @type {Object.<string, MuscleGroupDefinition>} */
export const MUSCLE_GROUP_CONFIG = {
  Chest:      { icon: "🎽", color: "#f97316" },
  Biceps:     { icon: "💪", color: "#ef4444" },
  Triceps:    { icon: "🦾", color: "#f43f5e" },
  Shoulders:  { icon: "🗻", color: "#eab308" },
  Back:       { icon: "🦅", color: "#22c55e" },
  Forearms:   { icon: "✊", color: "#14b8a6" },
  Abs:        { icon: "🧱", color: "#38bdf8" },
  Quads:      { icon: "🦵", color: "#6366f1" },
  Hamstrings: { icon: "🏃", color: "#8b5cf6" },
  Glutes:     { icon: "🍑", color: "#ec4899" },
  Calves:     { icon: "🐐", color: "#a855f7" },
};

/** Ordered list of Muscle Group keys — the "structure" the Exercise Forge page is built around. */
export const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_CONFIG);

/**
 * @param {*} value
 * @returns {boolean} true if value is a recognized Muscle Group key.
 */
export function isValidMuscleGroup(value) {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(MUSCLE_GROUP_CONFIG, value);
}

export function getMuscleGroupIcon(muscleGroup) {
  return MUSCLE_GROUP_CONFIG[muscleGroup]?.icon ?? "◇";
}

export function getMuscleGroupColor(muscleGroup) {
  return MUSCLE_GROUP_CONFIG[muscleGroup]?.color ?? "#5e5571";
}
