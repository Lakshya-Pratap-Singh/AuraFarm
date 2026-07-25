import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const submitResource = async (req, res, next) => {
  try {
    const { forgeId, title, description, tags, gifUrl, videoUrl, pdfUrl, externalUrl } = req.body;

    if (!forgeId || !title) {
      return res.status(400).json({ message: "forgeId and title are required" });
    }

    const forge = await prisma.forge.findUnique({ where: { id: forgeId } });
    if (!forge) {
      return res.status(404).json({ message: "Forge not found" });
    }

    const submission = await prisma.resourceSubmission.create({
      data: {
        userId: req.user.id,
        forgeId,
        title,
        description,
        tags: tags || [],
        gifUrl,
        videoUrl,
        pdfUrl,
        externalUrl,
        status: "PENDING"
      }
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await prisma.resourceSubmission.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};
