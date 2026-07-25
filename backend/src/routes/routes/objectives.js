import express from "express";
import {
  getObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
} from "../controllers/objectiveController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getObjectives);
router.post("/", createObjective);
router.put("/:id", updateObjective);
router.delete("/:id", deleteObjective);

export default router;
