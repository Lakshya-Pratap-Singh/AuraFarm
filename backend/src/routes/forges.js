import express from "express";
import { getForges, getForgeDetail } from "../controllers/forgeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getForges);
router.get("/:id", getForgeDetail);

export default router;
