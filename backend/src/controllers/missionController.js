/**
 * PATCHED VERSION of your real src/controllers/missionController.js.
 * ------------------------------------------------
 * Enum-value string fix: the three literal enum-value strings that need
 * to match the renamed enums (see prisma/migrations/.../migration.sql):
 *   "MEDIUM"/"NORMAL"/"LEARNING" -> "Medium"/"Normal"/"Learning"
 *   xpAmount lookup table keys EASY/NORMAL/HARD/LEGENDARY -> Easy/Normal/Hard/Legendary
 * (the XP amounts themselves — 10/25/50/100 — are unchanged, they
 * already matched the frontend's MISSION_XP_TABLE).
 *
 * Also fires a MISSION_COMPLETED notification via createNotification()
 * (fire-and-forget, never blocks the response) — the first concrete
 * example of a module calling the notification service instead of
 * writing to the Notification table directly.
 */

import { PrismaClient } from "@prisma/client";
import { createNotification } from "../notifications/notification.service.js";

const prisma = new PrismaClient();

export const getMissions = async (req, res, next) => {
  try {
    const missions = await prisma.mission.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { objective: true },
    });
    res.json(missions);
  } catch (error) {
    next(error);
  }
};

export const createMission = async (req, res, next) => {
  try {
    const {
      title,
      objectiveId,
      priority,
      difficulty,
      category,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Mission title is required" });
    }

    const mission = await prisma.mission.create({
      data: {
        userId: req.user.id,
        title,
        objectiveId: objectiveId || null,
        // --- CHANGED: Title Case to match the renamed enums ---
        priority: priority || "Medium",
        difficulty: difficulty || "Normal",
        category: category || "Learning",
        // --- end changed block ---
      },
      include: { objective: true },
    });

    await prisma.activityEvent.create({
      data: {
        userId: req.user.id,
        missionId: mission.id,
        type: "MISSION_CREATED",
        metadata: {
          title: mission.title,
          priority: mission.priority,
          difficulty: mission.difficulty,
          category: mission.category,
        },
      },
    });

    res.status(201).json(mission);
  } catch (error) {
    next(error);
  }
};

export const updateMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mission = await prisma.mission.update({
      where: { id, userId: req.user.id },
      data: req.body,
      include: { objective: true },
    });

    res.json(mission);
  } catch (error) {
    next(error);
  }
};

export const deleteMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.mission.delete({
      where: { id, userId: req.user.id },
    });

    await prisma.activityEvent.create({
      data: {
        userId: req.user.id,
        missionId: id,
        type: "MISSION_DELETED",
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleMissionCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mission = await prisma.mission.findUnique({
      where: { id, userId: req.user.id },
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    const nextCompleted = !mission.completed;
    const updatedMission = await prisma.mission.update({
      where: { id },
      data: { completed: nextCompleted },
      include: { objective: true },
    });

    // --- CHANGED: Title Case keys to match the renamed Difficulty enum.
    // Amounts (10/25/50/100) were already correct — only the keys changed.
    const xpAmount = {
      Easy: 10,
      Normal: 25,
      Hard: 50,
      Legendary: 100,
    }[updatedMission.difficulty];
    // --- end changed block ---

    if (nextCompleted && xpAmount) {
      await prisma.$transaction([
        prisma.xpEvent.create({
          data: {
            userId: req.user.id,
            missionId: updatedMission.id,
            amount: xpAmount,
            reason: "Mission completed",
          },
        }),
        prisma.user.update({
          where: { id: req.user.id },
          data: {
            totalXp: { increment: xpAmount },
          },
        }),
      ]);

      await prisma.activityEvent.create({
        data: {
          userId: req.user.id,
          missionId: updatedMission.id,
          type: "MISSION_COMPLETED",
          metadata: {
            xpEarned: xpAmount,
            category: updatedMission.category,
            difficulty: updatedMission.difficulty,
          },
        },
      });

      createNotification(req.user.id, {
        title: "Mission Complete",
        message: `"${updatedMission.title}" is complete. +${xpAmount} XP.`,
        type: "MISSION_COMPLETED",
        data: { missionTitle: updatedMission.title, xpEarned: xpAmount },
      }).catch((error) => console.error("[missionController] notification failed", error.message));
    } else if (!nextCompleted && xpAmount) {
      await prisma.activityEvent.create({
        data: {
          userId: req.user.id,
          missionId: updatedMission.id,
          type: "MISSION_REOPENED",
        },
      });
    }

    res.json(updatedMission);
  } catch (error) {
    next(error);
  }
};