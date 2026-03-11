import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  getMySessions,
  getSessionById,
  joinSession,
  analyzeCode,
  saveSnapshot,
  endSession,
  deleteSession,
  getStats,
  getAnalytics,
} from "../controllers/sessionController.js";

const router = express.Router();

// Stats / analytics (must come before /:id routes)
router.get("/stats", protectRoute, getStats);
router.get("/analytics", protectRoute, getAnalytics);
router.get("/my-sessions", protectRoute, getMySessions);

// CRUD
router.post("/", protectRoute, createSession);
router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/analyze", protectRoute, analyzeCode);
router.post("/:id/snapshot", protectRoute, saveSnapshot);
router.post("/:id/end", protectRoute, endSession);
router.delete("/:id", protectRoute, deleteSession);

export default router;
