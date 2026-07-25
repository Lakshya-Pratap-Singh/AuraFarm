import express from "express";
import { getPendingSubmissions, reviewSubmission } from "../controllers/admin/moderationController.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.use(protect, requireRole("ADMIN", "MODERATOR"));
router.get("/submissions", getPendingSubmissions);
router.patch("/submissions/:id/review", reviewSubmission);

export default router;
