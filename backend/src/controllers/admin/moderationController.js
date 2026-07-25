import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPendingSubmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const submissions = await prisma.resourceSubmission.findMany({
      where: { status: status || "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, username: true, email: true } } }
    });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

/**
 * Single review endpoint handling all three moderation actions
 * (Approve / Reject / Request Changes) via `action` in the body, so the
 * frontend's moderation dashboard can hit one endpoint with three button
 * states rather than three separate routes.
 */
export const reviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewNotes } = req.body; // action: "approve" | "reject" | "request_changes"

    const submission = await prisma.resourceSubmission.findUnique({ where: { id } });
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (action === "approve") {
      const result = await prisma.$transaction(async (tx) => {
        const resource = await tx.resource.create({
          data: {
            forgeId: submission.forgeId,
            title: submission.title,
            description: submission.description,
            resourceType: "OTHER", // moderator can refine after creation
            tags: submission.tags,
            gifUrl: submission.gifUrl,
            videoUrl: submission.videoUrl,
            pdfUrl: submission.pdfUrl,
            externalUrl: submission.externalUrl,
            verified: true,
            submittedBy: submission.userId
          }
        });

        const updatedSubmission = await tx.resourceSubmission.update({
          where: { id },
          data: {
            status: "APPROVED",
            reviewNotes: reviewNotes || null,
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            resourceId: resource.id
          }
        });

        return { resource, submission: updatedSubmission };
      });

      return res.json(result);
    }

    if (action === "reject") {
      const updated = await prisma.resourceSubmission.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewNotes: reviewNotes || null,
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      });
      return res.json(updated);
    }

    if (action === "request_changes") {
      const updated = await prisma.resourceSubmission.update({
        where: { id },
        data: {
          status: "CHANGES_REQUESTED",
          reviewNotes: reviewNotes || null,
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      });
      return res.json(updated);
    }

    return res.status(400).json({ message: "action must be approve, reject, or request_changes" });
  } catch (error) {
    next(error);
  }
};
