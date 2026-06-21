import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getXpSummary = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const xpEvents = await prisma.xpEvent.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const xpPerLevel = 250;
    const level = Math.floor(user.totalXp / xpPerLevel) + 1;
    const xpIntoLevel = user.totalXp % xpPerLevel;
    const xpNeededForNextLevel = xpPerLevel - xpIntoLevel;

    res.json({
      totalXp: user.totalXp,
      level,
      xpIntoLevel,
      xpNeededForNextLevel,
      xpPerLevel,
      recentEvents: xpEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const awardXp = async (req, res, next) => {
  try {
    const { amount, reason, missionId } = req.body;

    const xpEvent = await prisma.$transaction([
      prisma.xpEvent.create({
        data: {
          userId: req.user.id,
          missionId: missionId || null,
          amount,
          reason,
        },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          totalXp: { increment: amount },
        },
      }),
    ]);

    res.status(201).json({ xpEvent });
  } catch (error) {
    next(error);
  }
};
