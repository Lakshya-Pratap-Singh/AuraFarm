import { PrismaClient } from "@prisma/client";
import { SUPER_CATEGORIES } from "../config/forgeConfig.js";

const prisma = new PrismaClient();

export const getForges = async (req, res, next) => {
  try {
    const { superCategory } = req.query;

    const forges = await prisma.forge.findMany({
      where: {
        active: true,
        ...(superCategory ? { superCategory } : {})
      },
      orderBy: [{ superCategory: "asc" }, { order: "asc" }]
    });

    if (req.query.grouped === "true") {
      const grouped = Object.keys(SUPER_CATEGORIES).reduce((acc, key) => {
        acc[key] = { label: SUPER_CATEGORIES[key], forges: [] };
        return acc;
      }, {});
      for (const forge of forges) {
        grouped[forge.superCategory]?.forges.push(forge);
      }
      return res.json(grouped);
    }

    res.json(forges);
  } catch (error) {
    next(error);
  }
};

export const getForgeDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { muscleGroup, difficulty, resourceType } = req.query;

    const forge = await prisma.forge.findUnique({ where: { id } });
    if (!forge) {
      return res.status(404).json({ message: "Forge not found" });
    }

    const resources = await prisma.resource.findMany({
      where: {
        forgeId: id,
        verified: true,
        ...(muscleGroup ? { muscleGroup } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(resourceType ? { resourceType } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ forge, resources });
  } catch (error) {
    next(error);
  }
};
