/**
 * AuraFarm — Objective Progress Engine
 * ------------------------------------------------
 * Computes an Objective's progress from its linked (Forged) missions,
 * rather than the old manual `progress` field.
 *
 * INTEGRATION CHOICE (why this is read-time, not write-time):
 * The existing `toggleMissionCompletion` in missionController.js already
 * handles XP awarding + activity logging for every mission, forged or
 * not — it doesn't need to change at all for forged missions to keep
 * working exactly as before. Rather than hooking progress recalculation
 * into that existing, working function, this engine recomputes progress
 * on demand when requested (GET /objectives/forge/:id/aura-growth). That
 * keeps the integration 100% additive: zero lines changed in
 * missionController.js.
 *
 * Trade-off, stated plainly: this recomputes from scratch on each read
 * instead of maintaining a live-updated cache. For typical per-user data
 * volumes this is cheap. Objective.progressBreakdown (added in
 * schema.additions.prisma) is already there to cache the result later if
 * needed — deliberately deferred so this first pass touches no existing
 * code path.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Reads a mission's completion state whether the codebase is on the old
 * boolean `completed` field or a three-state `active|half|complete`
 * status field described in separate project notes. See the discrepancy
 * callout in schema.additions.prisma — this is the one place to update
 * once it's confirmed which shape is actually live.
 *
 * Returns a number in [0, 1] so a three-state "half" contributes partial
 * credit instead of forcing a binary in/out choice.
 */
function resolveMissionCompletionWeight(mission) {
  if (typeof mission.status === "string") {
    if (mission.status === "complete") return 1;
    if (mission.status === "half") return 0.5;
    return 0;
  }
  return mission.completed ? 1 : 0;
}

/**
 * Groups a Forge's key into one of the display buckets used by the
 * "Build Aesthetic Physique → Exercise 60% / Nutrition 30% / Recovery 40%"
 * example in the spec. Falls back to the Forge's own name if it doesn't
 * match a known bucket, so this never throws on a newly-added Forge.
 */
function forgeDisplayBucket(forgeKey) {
  if (!forgeKey) return "General";
  const key = forgeKey.toUpperCase();
  if (key.includes("EXERCISE")) return "Exercise";
  if (key.includes("NUTRITION")) return "Nutrition";
  if (key.includes("SLEEP")) return "Sleep";
  if (key.includes("RECOVERY")) return "Recovery";
  if (key.includes("READING")) return "Reading";
  if (key.includes("FOCUS")) return "Focus";
  if (key.includes("CODING")) return "Coding";
  if (key.includes("PLACEMENT")) return "Placement";
  if (key.includes("COMMUNICATION")) return "Communication";
  return key
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Computes progress for a single objective from its linked ResourceMission
 * rows. Returns null if the objective has no forged/linked missions yet
 * (caller should fall back to the objective's legacy manual `progress`
 * field in that case).
 */
export async function computeObjectiveProgress(objectiveId, userId) {
  const links = await prisma.resourceMission.findMany({
    where: { objectiveId, userId },
    include: {
      mission: true,
      resource: { include: { forge: true } }
    }
  });

  if (!links.length) return null;

  const byBucket = new Map();

  for (const link of links) {
    const bucket = forgeDisplayBucket(link.resource?.forge?.key);
    const weight = resolveMissionCompletionWeight(link.mission);

    if (!byBucket.has(bucket)) byBucket.set(bucket, { total: 0, sumWeight: 0 });
    const entry = byBucket.get(bucket);
    entry.total += 1;
    entry.sumWeight += weight;
  }

  const breakdown = {};
  let overallSum = 0;
  let overallCount = 0;

  for (const [bucket, { total, sumWeight }] of byBucket.entries()) {
    const pct = Math.round((sumWeight / total) * 100);
    breakdown[bucket] = pct;
    overallSum += sumWeight;
    overallCount += total;
  }

  const overall = overallCount > 0 ? Math.round((overallSum / overallCount) * 100) : 0;

  return {
    overall,
    breakdown,
    linkedMissionCount: links.length,
    computedAt: new Date().toISOString()
  };
}
