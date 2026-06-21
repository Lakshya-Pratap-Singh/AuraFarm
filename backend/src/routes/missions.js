import express from "express";
import {
  getMissions,
  createMission,
  updateMission,
  deleteMission,
  toggleMissionCompletion,
} from "../controllers/missionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getMissions);
router.post("/", createMission);
router.put("/:id", updateMission);
router.delete("/:id", deleteMission);
router.patch("/:id/toggle-complete", toggleMissionCompletion);

export default router;
