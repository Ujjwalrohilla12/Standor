import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
} from "../controllers/sessionController.js";
import { analyzeCode, getAnalysis } from "../controllers/aiController.js";
import { saveSnapshot, getSnapshots } from "../controllers/snapshotController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);

// AI analysis
router.post("/:id/analyze", protectRoute, analyzeCode);
router.get("/:id/analysis", protectRoute, getAnalysis);

// Code snapshots
router.post("/:id/snapshot", protectRoute, saveSnapshot);
router.get("/:id/snapshots", protectRoute, getSnapshots);

export default router;
