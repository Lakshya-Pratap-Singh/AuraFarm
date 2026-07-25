import express from "express";
import userRoutes from "./users.js";
import objectiveRoutes from "./objectives.js";
import missionRoutes from "./missions.js";
import xpRoutes from "./xp.js";
import analyticsRoutes from "./analytics.js";
import activityRoutes from "./activity.js";

// --- NEW imports for the Objective/Forge/Resource/Mission system ---
// Nothing above this line changed from the original file.
import forgeRoutes from "./forges.js";
import resourceRoutes from "./resources.js";
import resourceSubmissionRoutes from "./resourceSubmissions.js";
import adminRoutes from "./admin.js";
import objectivesForgeRoutes from "./objectivesForge.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/objectives", objectiveRoutes);
router.use("/missions", missionRoutes);
router.use("/xp", xpRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/activity", activityRoutes);

// --- NEW routes ---
// Mounted at a distinct prefix ("/objectives/forge") rather than reusing
// "/objectives" for POST "/", so the existing POST /objectives (legacy
// free-form creation) is never shadowed or touched.
router.use("/forges", forgeRoutes);
router.use("/resources", resourceRoutes);
router.use("/resource-submissions", resourceSubmissionRoutes);
router.use("/admin", adminRoutes);
router.use("/objectives/forge", objectivesForgeRoutes);

export default router;
