import express from "express";
import userRoutes from "./users.js";
import objectiveRoutes from "./objectives.js";
import missionRoutes from "./missions.js";
import xpRoutes from "./xp.js";
import analyticsRoutes from "./analytics.js";
import activityRoutes from "./activity.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/objectives", objectiveRoutes);
router.use("/missions", missionRoutes);
router.use("/xp", xpRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/activity", activityRoutes);

export default router;
