import { PrismaClient } from "@prisma/client";
import {
  SUPER_CATEGORIES,
  getObjectiveTypesForSuperCategory,
  getAutoUnlockForges
} from "../config/forgeConfig.js";
import { computeObjectiveProgress } from "../services/objectiveProgressService.js";

const prisma = new PrismaClient();

/** Step 1+2 data for the structured objective creation wizard. */
export const getObjectiveTaxonomy = async (req, res, next) => {
  try {
    const taxonomy = Object.keys(SUPER_CATEGORIES).map((key) => ({
      key,
      label: SUPER_CATEGORIES[key],
      objectiveTypes: Object.entries(getObjectiveTypesForSuperCategory(key)).map(
        ([typeKey, def]) => ({ key: typeKey, label: def.label })
      )
    }));
    res.json(taxonomy);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a structured objective (superCategory + objectiveType + title)
 * and, if `unlockRecommendedResources` is true, activates ("unlocks") the
 * Forges configured for that objective type in forgeConfig.js.
 *
 * This is a NEW route (POST /objectives/forge) rather than a change to
 * the existing POST /objectives — the old endpoint keeps behaving
 * exactly as it does today for any caller still using the free-form flow.
 */
export const createStructuredObjective = async (req, res, next) => {
  try {
    const { superCategory, objectiveType, title, unlockRecommendedResources } = req.body;

    if (!superCategory || !SUPER_CATEGORIES[superCategory]) {
      return res.status(400).json({ message: "A valid superCategory is required" });
    }
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const objective = await prisma.objective.create({
      data: {
        userId: req.user.id,
        title,
        superCategory,
        objectiveType: objectiveType || null,
        progress: 0
      }
    });

    let unlockedForges = [];
    if (unlockRecommendedResources && objectiveType) {
      const forgeKeys = getAutoUnlockForges(superCategory, objectiveType);
      if (forgeKeys.length) {
        unlockedForges = await prisma.forge.findMany({
          where: { key: { in: forgeKeys } }
        });
      }
    }

    await prisma.activityEvent.create({
      data: {
        userId: req.user.id,
        objectiveId: objective.id,
        type: "OBJECTIVE_CREATED",
        metadata: {
          title: objective.title,
          superCategory,
          objectiveType,
          unlockedForges: unlockedForges.map((f) => f.key)
        }
      }
    });

    res.status(201).json({ objective, unlockedForges });
  } catch (error) {
    next(error);
  }
};

/**
 * "Aura Growth" — the computed progress view. Falls back to the
 * objective's existing legacy `progress` field if it has no linked/forged
 * missions yet, so this never returns an empty/zero result for objectives
 * created the old way.
 */
export const getAuraGrowth = async (req, res, next) => {
  try {
    const { id } = req.params;

    const objective = await prisma.objective.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!objective) {
      return res.status(404).json({ message: "Objective not found" });
    }

    const computed = await computeObjectiveProgress(id, req.user.id);

    if (!computed) {
      return res.json({
        overall: objective.progress ?? 0,
        breakdown: null,
        source: "manual"
      });
    }

    res.json({ ...computed, source: "linked_missions" });
  } catch (error) {
    next(error);
  }
};
