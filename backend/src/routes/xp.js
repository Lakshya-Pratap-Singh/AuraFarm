import express from "express";
import { getXpSummary, awardXp } from "../controllers/xpController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/summary", getXpSummary);
router.post("/award", awardXp);

export default router;
