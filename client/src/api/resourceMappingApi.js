// resourceMappingApi.js — Resource Mapping Engine (API layer)
//
// IMPORTANT CONTEXT: this codebase has no running backend yet (see the
// AuraForge Resource System implementation plan — auth is Firebase-only,
// everything else persists client-side). These handlers are written
// framework-agnostic on purpose: each one takes a plain `request` object
// and returns a plain `{ status, body }` result, with zero dependency on
// Express/Firebase Functions/Next.js/etc. That means once a backend is
// stood up, each function below can be wrapped 1:1 by that framework's
// router with no rewrite — e.g.
//
//   // Express, once a server exists:
//   app.get("/api/forge-types", (req, res) => {
//     const { status, body } = getForgeTypes();
//     res.status(status).json(body);
//   });
//
// Nothing in this file is wired into the running app yet — no routes are
// mounted anywhere, and no UI calls these. That's intentional: this task
// is the mapping engine only, not the resource pages or a live server.

import {
  getAllForgeTypes,
  getAllResourceMappings,
  getForgesForObjectiveType,
  hasResourceMapping,
  checkResourceMappingConfigHealth,
} from "../services/resourceMappingService.js";
import { isValidSuperCategory } from "../data/objectiveCategories.js";

/**
 * @typedef {Object} ApiResult
 * @property {number} status
 * @property {Object} body
 */

/**
 * Intended contract: GET /api/forge-types
 * Lists every Forge (resource type) in the catalog.
 * @returns {ApiResult}
 */
export function getForgeTypes() {
  return { status: 200, body: { data: getAllForgeTypes() } };
}

/**
 * Intended contract: GET /api/resource-mappings
 * Lists the full Objective Type -> Forge mapping table.
 * @returns {ApiResult}
 */
export function getResourceMappings() {
  return { status: 200, body: { data: getAllResourceMappings() } };
}

/**
 * Intended contract: GET /api/resource-mappings/:objectiveType
 * Resolves the Forges for a single Objective Type. Accepts either the
 * display label ("Aesthetic Physique") or canonical key ("AESTHETIC_PHYSIQUE")
 * as the :objectiveType path param.
 *
 * @param {{ params: { objectiveType?: string } }} request
 * @returns {ApiResult}
 */
export function getResourceMappingForObjectiveType(request) {
  const objectiveType = request?.params?.objectiveType;
  if (!objectiveType) {
    return { status: 400, body: { error: "objectiveType path parameter is required." } };
  }
  if (!hasResourceMapping(objectiveType)) {
    return { status: 404, body: { error: `No resource mapping found for objective type "${objectiveType}".` } };
  }
  return {
    status: 200,
    body: { data: { objectiveType, forges: getForgesForObjectiveType(objectiveType) } },
  };
}

/**
 * Intended contract: GET /api/resource-mappings?superCategory=Physical+Growth
 * Optional filter variant — resolves mappings for every Objective Type
 * under a given Super Category. Included because that's the natural
 * access pattern once an Objectives page links out to "this objective's
 * Forges."
 *
 * @param {{ query: { superCategory?: string } }} request
 * @returns {ApiResult}
 */
export function getResourceMappingsBySuperCategory(request) {
  const superCategory = request?.query?.superCategory;
  if (superCategory && !isValidSuperCategory(superCategory)) {
    return { status: 400, body: { error: `Unknown superCategory "${superCategory}".` } };
  }
  const data = getAllResourceMappings();
  return { status: 200, body: { data, filteredBy: superCategory ?? null } };
}

/**
 * Intended contract: GET /api/resource-mappings/_health
 * Not user-facing — a config-integrity check (see
 * validateResourceMappingConfig) exposed so CI/monitoring can catch a
 * mapping/config drift before it ships.
 * @returns {ApiResult}
 */
export function getResourceMappingConfigHealth() {
  const { valid, errors } = checkResourceMappingConfigHealth();
  return { status: valid ? 200 : 500, body: { valid, errors } };
}
