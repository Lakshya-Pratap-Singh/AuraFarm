import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getObjectives = async (req, res, next) => {
  try {
    const objectives = await prisma.objective.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(objectives);
  } catch (error) {
    next(error);
  }
};

export const createObjective = async (req, res, next) => {
  try {
    const { title, description, targetDate, progress } = req.body;
    const objective = await prisma.objective.create({
      data: {
        userId: req.user.id,
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
        progress: progress ?? 0,
      },
    });

    await prisma.activityEvent.create({
      data: {
        userId: req.user.id,
        objectiveId: objective.id,
        type: "OBJECTIVE_CREATED",
        metadata: { title: objective.title },
      },
    });

    res.status(201).json(objective);
  } catch (error) {
    next(error);
  }
};

export const updateObjective = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const objective = await prisma.objective.update({
      where: { id, userId: req.user.id },
      data,
    });

    await prisma.activityEvent.create({
      data: {
        userId: req.user.id,
        objectiveId: objective.id,
        type: "OBJECTIVE_UPDATED",
        metadata: { title: objective.title },
      },
    });

    res.json(objective);
  } catch (error) {
    next(error);
  }
};

export const deleteObjective = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.objective.delete({
      where: { id, userId: req.user.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
