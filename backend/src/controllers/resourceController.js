import { PrismaClient } from "@prisma/client";
import { FORGE_TO_MISSION_CATEGORY } from "../config/forgeConfig.js";

const prisma = new PrismaClient();

export const getResources = async (req, res, next) => {
  try {
    const { forgeId, muscleGroup, difficulty, resourceType, tag, search } = req.query;

    const resources = await prisma.resource.findMany({
      where: {
        verified: true,
        ...(forgeId ? { forgeId } : {}),
        ...(muscleGroup ? { muscleGroup } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(resourceType ? { resourceType } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(resources);
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { forge: true }
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
};

/** ⭐ Save Resource / un-save (toggle). */
export const toggleSaveResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.savedResource.findUnique({
      where: { userId_resourceId: { userId, resourceId: id } }
    });

    if (existing) {
      await prisma.savedResource.delete({ where: { id: existing.id } });
      return res.json({ saved: false });
    }

    await prisma.savedResource.create({ data: { userId, resourceId: id } });
    res.json({ saved: true });
  } catch (error) {
    next(error);
  }
};

export const getSavedResources = async (req, res, next) => {
  try {
    const saved = await prisma.savedResource.findMany({
      where: { userId: req.user.id },
      include: { resource: { include: { forge: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(saved.map((s) => s.resource));
  } catch (error) {
    next(error);
  }
};

/**
 * ⚔ Forge Mission — the flagship action. Turns a Resource into a real
 * Mission row (so it shows up everywhere missions already show up —
 * mission lists, XP on completion via the EXISTING toggleMissionCompletion
 * endpoint, streaks, activity feed) and links it to the Resource (and
 * optionally an Objective) via ResourceMission.
 *
 * Deliberately does NOT duplicate any of missionController.js's XP/
 * activity-logging logic — it creates a plain Mission row exactly like
 * the existing createMission does, so completing it later goes through
 * the same, unmodified, already-working completion endpoint.
 */
export const forgeMissionFromResource = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;
    const {
      objectiveId,
      title, // optional override, e.g. "3 Sets × 12 Reps Dumbbell Curl"
      priority,
      difficulty, // mission difficulty (EASY/NORMAL/HARD/LEGENDARY) — existing enum
      category, // existing mission category
      forgeParams // { sets, reps, duration, frequency, ... } — shape varies by Forge
    } = req.body;

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: { forge: true }
    });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (objectiveId) {
      const objective = await prisma.objective.findFirst({
        where: { id: objectiveId, userId: req.user.id }
      });
      if (!objective) {
        return res.status(404).json({ message: "Objective not found" });
      }
    }

    const missionTitle = title || `Forged: ${resource.title}`;

    const result = await prisma.$transaction(async (tx) => {
      const mission = await tx.mission.create({
        data: {
          userId: req.user.id,
          title: missionTitle,
          objectiveId: objectiveId || null,
          // Title Case to match the real frontend's Mission field values
          // (see PRIORITY_CONFIG/DIFFICULTY_CONFIG/CATEGORY_CONFIG in
          // Missions.jsx). Category defaults per-Forge via
          // FORGE_TO_MISSION_CATEGORY rather than one hardcoded value,
          // since a Reading Forge mission and an Exercise Forge mission
          // should land in different real categories.
          priority: priority || "Medium",
          difficulty: difficulty || "Normal",
          category: category || FORGE_TO_MISSION_CATEGORY[resource.forge?.key] || "Learning",
          forgedFromResourceId: resource.id,
          forgeParams: forgeParams || null
        }
      });

      const link = await tx.resourceMission.create({
        data: {
          resourceId: resource.id,
          missionId: mission.id,
          objectiveId: objectiveId || null,
          userId: req.user.id
        }
      });

      await tx.activityEvent.create({
        data: {
          userId: req.user.id,
          missionId: mission.id,
          objectiveId: objectiveId || null,
          type: "MISSION_FORGED",
          metadata: {
            resourceId: resource.id,
            resourceTitle: resource.title,
            title: missionTitle
          }
        }
      });

      return { mission, link };
    });

    res.status(201).json(result.mission);
  } catch (error) {
    next(error);
  }
};
