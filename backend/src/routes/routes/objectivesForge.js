import express from "express";
import {
  getObjectiveTaxonomy,
  createStructuredObjective,
  getAuraGrowth
} from "../controllers/objectiveForgeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/taxonomy", getObjectiveTaxonomy);
router.post("/", createStructuredObjective);
router.get("/:id/aura-growth", getAuraGrowth);

export default router;
