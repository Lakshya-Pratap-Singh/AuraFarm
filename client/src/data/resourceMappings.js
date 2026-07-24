// resourceMappings.js — Resource Mapping Engine (configuration layer)
//
// Centralized, declarative map of: Objective Type -> the Forges (resource
// types) that objective type automatically pulls in. This is the ONLY place
// that knowledge should live — services, API handlers, and (eventually) UI
// components all read through this file rather than re-declaring mappings.
//
// This module intentionally does not build any UI and does not persist
// anything — it is pure configuration + pure functions. See the bottom of
// this file for how it maps onto a future backend schema.
//
// Keys are derived programmatically from the Objective Type labels defined
// in objectiveCategories.js (via toObjectiveTypeKey), so the mapping table
// can never silently drift from the canonical objective type list — add a
// new Objective Type there, add one line here, done.

import { SUPER_CATEGORY_CONFIG } from "./objectiveCategories.js";

/**
 * @typedef {Object} ForgeTypeDefinition
 * @property {string} label       - Display name, e.g. "Exercise Forge".
 * @property {string} icon        - Emoji sigil (placeholder pending real art, same convention as SUPER_CATEGORY_CONFIG).
 * @property {string} description - One-line description of what this Forge represents.
 */

/**
 * Converts an Objective Type label (as stored on an objective, e.g.
 * "Aesthetic Physique") into its canonical SCREAMING_SNAKE_CASE key
 * (e.g. "AESTHETIC_PHYSIQUE"). Used as the lookup key for both
 * FORGE_TYPES and OBJECTIVE_TYPE_RESOURCE_MAP.
 *
 * @param {string|null|undefined} label
 * @returns {string|null}
 */
export function toObjectiveTypeKey(label) {
  if (typeof label !== "string" || !label.trim()) return null;
  return label
    .trim()
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Catalog of every Forge (resource type) referenced by any mapping below.
 * This is the single source of truth for Forge identity/metadata — a
 * mapping entry only ever stores a FORGE_TYPES key, never a duplicated
 * label/icon.
 * @type {Object.<string, ForgeTypeDefinition>}
 */
export const FORGE_TYPES = {
  EXERCISE_FORGE:     { label: "Exercise Forge",     icon: "🏋️", description: "Structured training and workout consistency." },
  NUTRITION_FORGE:     { label: "Nutrition Forge",     icon: "🥗", description: "Diet quality, meal planning, and intake tracking." },
  SLEEP_FORGE:          { label: "Sleep Forge",          icon: "🛌", description: "Sleep duration and quality." },
  RECOVERY_FORGE:       { label: "Recovery Forge",       icon: "♻️", description: "Rest days, mobility, and injury prevention." },
  CARDIO_FORGE:          { label: "Cardio Forge",          icon: "🏃", description: "Cardiovascular conditioning." },
  READING_FORGE:         { label: "Reading Forge",         icon: "📖", description: "Reading volume and consistency." },
  FOCUS_FORGE:           { label: "Focus Forge",           icon: "🎯", description: "Deep work and attention span." },
  NOTES_FORGE:            { label: "Notes Forge",            icon: "📝", description: "Capturing and organizing what's learned." },
  MEDITATION_FORGE:       { label: "Meditation Forge",       icon: "🧘", description: "Mindfulness and meditation practice." },
  HABIT_FORGE:             { label: "Habit Forge",             icon: "🔁", description: "General habit consistency and streaks." },
  SKILL_FORGE:              { label: "Skill Forge",              icon: "🛠️", description: "Deliberate skill-building activity." },
  PRACTICE_FORGE:           { label: "Practice Forge",           icon: "🎼", description: "Repeated hands-on practice reps." },
  PORTFOLIO_FORGE:          { label: "Portfolio Forge",          icon: "📁", description: "Work samples and demonstrable output." },
  NETWORKING_FORGE:         { label: "Networking Forge",         icon: "🌐", description: "Professional relationship building." },
  COMMUNICATION_FORGE:      { label: "Communication Forge",      icon: "🗣️", description: "Speaking and interpersonal communication." },
  COMMUNITY_FORGE:           { label: "Community Forge",           icon: "🏘️", description: "Group/community participation." },
  BUDGET_FORGE:               { label: "Budget Forge",               icon: "📊", description: "Spending tracking and budgeting discipline." },
  INVESTMENT_FORGE:           { label: "Investment Forge",           icon: "📈", description: "Investing activity and portfolio growth." },
  DEBT_FORGE:                  { label: "Debt Forge",                  icon: "⛓️", description: "Debt paydown progress." },
  CREATIVITY_FORGE:            { label: "Creativity Forge",            icon: "🎨", description: "Creative output and idea generation." },
  SHOWCASE_FORGE:               { label: "Showcase Forge",               icon: "🖼️", description: "Sharing/publishing creative work." },
  RELATIONSHIP_FORGE:           { label: "Relationship Forge",           icon: "🤝", description: "Personal relationship investment." },
  DECLUTTER_FORGE:                { label: "Declutter Forge",                icon: "🧹", description: "Simplifying possessions and commitments." },
  TIME_FORGE:                      { label: "Time Forge",                      icon: "⏳", description: "Time allocation and scheduling discipline." },
};

/**
 * Raw mapping table, keyed by the human-readable Objective Type label
 * exactly as it appears in objectiveCategories.js's SUPER_CATEGORY_CONFIG.
 * Kept as labels here (rather than pre-converted keys) so this table reads
 * as a direct, auditable mirror of the Objective Type catalog. Converted to
 * canonical keys below via toObjectiveTypeKey().
 * @type {Object.<string, string[]>}
 */
const RAW_OBJECTIVE_TYPE_RESOURCE_MAP = {
  // Physical Growth
  "Aesthetic Physique": ["EXERCISE_FORGE", "NUTRITION_FORGE", "SLEEP_FORGE", "RECOVERY_FORGE"],
  "Lose Fat":            ["EXERCISE_FORGE", "NUTRITION_FORGE", "CARDIO_FORGE", "RECOVERY_FORGE"],
  "Gain Strength":       ["EXERCISE_FORGE", "NUTRITION_FORGE", "RECOVERY_FORGE", "SLEEP_FORGE"],

  // Mental Growth
  "Reading Habit": ["READING_FORGE", "FOCUS_FORGE", "NOTES_FORGE"],
  "Meditation":     ["MEDITATION_FORGE", "FOCUS_FORGE", "SLEEP_FORGE"],
  "Focus":           ["FOCUS_FORGE", "HABIT_FORGE", "NOTES_FORGE"],

  // Career Growth
  "Skill Mastery":   ["SKILL_FORGE", "PRACTICE_FORGE", "NOTES_FORGE"],
  "Promotion Track": ["SKILL_FORGE", "PORTFOLIO_FORGE", "NETWORKING_FORGE"],
  "Networking":       ["NETWORKING_FORGE", "COMMUNICATION_FORGE", "COMMUNITY_FORGE"],

  // Financial Growth
  "Save Money": ["BUDGET_FORGE", "HABIT_FORGE", "NOTES_FORGE"],
  "Investing":   ["INVESTMENT_FORGE", "BUDGET_FORGE", "NOTES_FORGE"],
  "Debt Free":    ["DEBT_FORGE", "BUDGET_FORGE", "HABIT_FORGE"],

  // Creative Growth
  "Writing":         ["CREATIVITY_FORGE", "PRACTICE_FORGE", "NOTES_FORGE"],
  "Art & Design":     ["CREATIVITY_FORGE", "PRACTICE_FORGE", "SHOWCASE_FORGE"],
  "Music Practice":   ["PRACTICE_FORGE", "CREATIVITY_FORGE", "FOCUS_FORGE"],

  // Social Growth
  "Relationship Building": ["RELATIONSHIP_FORGE", "COMMUNICATION_FORGE", "HABIT_FORGE"],
  "Public Speaking":        ["COMMUNICATION_FORGE", "PRACTICE_FORGE", "FOCUS_FORGE"],
  "Community Involvement":  ["COMMUNITY_FORGE", "RELATIONSHIP_FORGE", "HABIT_FORGE"],

  // Lifestyle Growth
  "Sleep Optimization": ["SLEEP_FORGE", "RECOVERY_FORGE", "HABIT_FORGE"],
  "Minimalism":          ["DECLUTTER_FORGE", "HABIT_FORGE", "NOTES_FORGE"],
  "Time Management":     ["TIME_FORGE", "FOCUS_FORGE", "HABIT_FORGE"],
};

/**
 * The actual engine: Objective Type key (SCREAMING_SNAKE_CASE) -> ordered
 * array of Forge keys. This is what the service layer/API/UI should read.
 * @type {Object.<string, string[]>}
 */
export const OBJECTIVE_TYPE_RESOURCE_MAP = Object.fromEntries(
  Object.entries(RAW_OBJECTIVE_TYPE_RESOURCE_MAP).map(([label, forgeKeys]) => [
    toObjectiveTypeKey(label),
    forgeKeys,
  ])
);

/**
 * Validates the mapping config for internal consistency:
 *  - every Objective Type defined in objectiveCategories.js has a mapping here
 *  - every mapping here points only at Forge keys that exist in FORGE_TYPES
 *  - no mapping entry is empty
 * This is what catches config drift (e.g. a new Objective Type added to
 * objectiveCategories.js without a corresponding Forge mapping) instead of
 * failing silently at render time once resource pages exist.
 *
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateResourceMappingConfig() {
  const errors = [];

  const allObjectiveTypeLabels = Object.values(SUPER_CATEGORY_CONFIG).flatMap((cfg) => cfg.objectiveTypes);
  for (const label of allObjectiveTypeLabels) {
    const key = toObjectiveTypeKey(label);
    if (!OBJECTIVE_TYPE_RESOURCE_MAP[key]) {
      errors.push(`Objective Type "${label}" (key: ${key}) has no entry in OBJECTIVE_TYPE_RESOURCE_MAP.`);
    }
  }

  for (const [key, forgeKeys] of Object.entries(OBJECTIVE_TYPE_RESOURCE_MAP)) {
    if (!Array.isArray(forgeKeys) || forgeKeys.length === 0) {
      errors.push(`Objective Type key "${key}" maps to an empty/invalid Forge list.`);
      continue;
    }
    for (const forgeKey of forgeKeys) {
      if (!FORGE_TYPES[forgeKey]) {
        errors.push(`Objective Type key "${key}" references unknown Forge key "${forgeKey}".`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// Fail loudly in development if the config drifts out of sync — silent in
// production so a bad deploy never crashes the app, only build-time/dev
// feedback is affected.
if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
  const { valid, errors } = validateResourceMappingConfig();
  if (!valid) {
    // eslint-disable-next-line no-console
    console.warn("[resourceMappings] config validation failed:\n" + errors.join("\n"));
  }
}

/*
 * ── Future backend schema (documented here, not yet implemented) ─────────
 *
 * Both tables below are CONFIG tables (server-owned, not per-user data) —
 * they mirror this file 1:1 and would let the mapping be tuned without a
 * redeploy once a backend exists:
 *
 *   forge_types
 *     key          text primary key   -- e.g. "EXERCISE_FORGE"
 *     label         text
 *     icon           text
 *     description    text
 *
 *   objective_type_resource_map
 *     id            serial primary key
 *     objective_type_key  text  -- e.g. "AESTHETIC_PHYSIQUE"
 *     forge_key            text references forge_types(key)
 *     sort_order            int
 *
 * See resourceMappingService.js / resourceMappingApi.js for the
 * framework-agnostic layer that would sit in front of these tables.
 */
