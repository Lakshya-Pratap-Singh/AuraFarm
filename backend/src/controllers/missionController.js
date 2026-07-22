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
        priority: priority || "MEDIUM",
        difficulty: difficulty || "NORMAL",
        category: category || "LEARNING",
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

    const xpAmount = {
      EASY: 10,
      NORMAL: 25,
      HARD: 50,
      LEGENDARY: 100,
    }[updatedMission.difficulty];

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
      await createNotification(
        req.user.id,
        "Mission Completed",
        `${updatedMission.title} completed successfully. +${xpAmount} XP earned.`,
        "MISSION_REMINDER"
      );
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
