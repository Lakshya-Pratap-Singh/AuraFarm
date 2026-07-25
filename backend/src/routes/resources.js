import express from "express";
import {
  getResources,
  getResourceById,
  toggleSaveResource,
  getSavedResources,
  forgeMissionFromResource
} from "../controllers/resourceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getResources);
router.get("/saved", getSavedResources);
router.get("/:id", getResourceById);
router.post("/:id/save", toggleSaveResource);
router.post("/:id/forge-mission", forgeMissionFromResource);

export default router;
