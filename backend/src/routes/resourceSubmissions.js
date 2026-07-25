import express from "express";
import { submitResource, getMySubmissions } from "../controllers/resourceSubmissionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getMySubmissions);
router.post("/", submitResource);

export default router;
