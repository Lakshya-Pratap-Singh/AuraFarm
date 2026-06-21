import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getActivityFeed = async (req, res, next) => {
  try {
    const activity = await prisma.activityEvent.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    res.json(activity);
  } catch (error) {
    next(error);
  }
};
