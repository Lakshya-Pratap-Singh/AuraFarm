// resourceMappingService.js — Resource Mapping Engine (service layer)
//
// This is the ONLY module UI components and API handlers should import to
// resolve Objective Type -> Forge relationships. It never exposes raw
// config objects for mutation, and it centralizes the label<->key
// resolution so nothing outside data/resourceMappings.js needs to know
// about toObjectiveTypeKey or the shape of the raw config.
//
// Pure, synchronous, and side-effect free — safe to call from a React
// component, a Node/Express route handler, or a Firebase Cloud Function
// without modification.

import {
  FORGE_TYPES,
  OBJECTIVE_TYPE_RESOURCE_MAP,
  toObjectiveTypeKey,
  validateResourceMappingConfig,
} from "../data/resourceMappings.js";

/**
 * @typedef {Object} ForgeResult
 * @property {string} key         - Canonical Forge key, e.g. "EXERCISE_FORGE".
 * @property {string} label       - Display name, e.g. "Exercise Forge".
 * @property {string} icon
 * @property {string} description
 */

function toForgeResult(forgeKey) {
  const def = FORGE_TYPES[forgeKey];
  if (!def) return null;
  return { key: forgeKey, ...def };
}

/**
 * Resolves the Forges an Objective Type automatically maps to.
 * Accepts either the display label ("Aesthetic Physique") or the
 * canonical key ("AESTHETIC_PHYSIQUE") so callers don't need to know
 * which form they have.
 *
 * @param {string|null|undefined} objectiveType
 * @returns {ForgeResult[]} Empty array if unmapped/unrecognized/null (never throws).
 */
export function getForgesForObjectiveType(objectiveType) {
  if (!objectiveType) return [];
  const key = OBJECTIVE_TYPE_RESOURCE_MAP[objectiveType]
    ? objectiveType                     // already a canonical key
    : toObjectiveTypeKey(objectiveType); // treat as a label
  const forgeKeys = OBJECTIVE_TYPE_RESOURCE_MAP[key] ?? [];
  return forgeKeys.map(toForgeResult).filter(Boolean);
}

/**
 * Convenience wrapper for an Objective record (as produced by
 * App.jsx's normalizeObjective) — resolves Forges from its
 * `objectiveType` field directly.
 *
 * @param {{ objectiveType?: string|null }} objective
 * @returns {ForgeResult[]}
 */
export function getForgesForObjective(objective) {
  return getForgesForObjectiveType(objective?.objectiveType);
}

/**
 * @param {string|null|undefined} objectiveType - label or canonical key.
 * @returns {boolean} true if this Objective Type has a Forge mapping.
 */
export function hasResourceMapping(objectiveType) {
  if (!objectiveType) return false;
  const key = OBJECTIVE_TYPE_RESOURCE_MAP[objectiveType] ? objectiveType : toObjectiveTypeKey(objectiveType);
  return Boolean(OBJECTIVE_TYPE_RESOURCE_MAP[key]?.length);
}

/**
 * @returns {ForgeResult[]} Every Forge type in the catalog.
 */
export function getAllForgeTypes() {
  return Object.entries(FORGE_TYPES).map(([key, def]) => ({ key, ...def }));
}

/**
 * @returns {{ objectiveTypeKey: string, forges: ForgeResult[] }[]} The full mapping table, resolved.
 */
export function getAllResourceMappings() {
  return Object.keys(OBJECTIVE_TYPE_RESOURCE_MAP).map((objectiveTypeKey) => ({
    objectiveTypeKey,
    forges: getForgesForObjectiveType(objectiveTypeKey),
  }));
}

/**
 * Reverse lookup — which Objective Types pull in a given Forge.
 * Useful once resource pages exist (e.g. "everything feeding Exercise Forge").
 *
 * @param {string} forgeKey - Canonical Forge key, e.g. "EXERCISE_FORGE".
 * @returns {string[]} Objective Type keys that map to this Forge.
 */
export function getObjectiveTypesForForge(forgeKey) {
  if (!forgeKey || !FORGE_TYPES[forgeKey]) return [];
  return Object.entries(OBJECTIVE_TYPE_RESOURCE_MAP)
    .filter(([, forgeKeys]) => forgeKeys.includes(forgeKey))
    .map(([objectiveTypeKey]) => objectiveTypeKey);
}

/**
 * Exposes config validation through the service layer so callers (e.g. an
 * admin/health-check endpoint) don't need to import data/resourceMappings.js
 * directly.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function checkResourceMappingConfigHealth() {
  return validateResourceMappingConfig();
}
