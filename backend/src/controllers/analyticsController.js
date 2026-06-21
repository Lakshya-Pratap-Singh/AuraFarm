import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAnalytics = async (req, res, next) => {
  try {
    const [missions, objectives, xpEvents, activityEvents] = await Promise.all([
      prisma.mission.findMany({
        where: { userId: req.user.id },
      }),
      prisma.objective.findMany({
        where: { userId: req.user.id },
      }),
      prisma.xpEvent.findMany({
        where: { userId: req.user.id },
      }),
      prisma.activityEvent.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const totalMissions = missions.length;
    const completedMissions = missions.filter((m) => m.completed).length;
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter((o) => o.completed).length;

    const categoryCounts = missions.reduce((acc, mission) => {
      acc[mission.category] = (acc[mission.category] || 0) + 1;
      return acc;
    }, {});

    const difficultyCounts = missions.reduce((acc, mission) => {
      acc[mission.difficulty] = (acc[mission.difficulty] || 0) + 1;
      return acc;
    }, {});

    const mostCompletedCategory = Object.entries(
      missions.reduce((acc, mission) => {
        if (mission.completed) {
          acc[mission.category] = (acc[mission.category] || 0) + 1;
        }
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const totalXpEarned = xpEvents.reduce((sum, event) => sum + event.amount, 0);

    res.json({
      totalMissions,
      completedMissions,
      totalObjectives,
      completedObjectives,
      completionRate:
        totalMissions === 0
          ? 0
          : Math.round((completedMissions / totalMissions) * 100),
      categoryCounts,
      difficultyCounts,
      mostCompletedCategory,
      totalXpEarned,
      recentActivity: activityEvents,
    });
  } catch (error) {
    next(error);
  }
};
