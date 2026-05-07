import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  getMySessions,
  getSessionById,
  joinSession,
  analyzeCode,
  saveSnapshot,
  getReport,
  endSession,
  deleteSession,
  getStats,
  getAnalytics,
  getReportHistory,
  getFullReport,
  analyzeProgression,
  getAnalyses,
  getSnapshotHistory,
  uploadAudioChunk,
  finalizeMeetingAndSendReports,
  getMeetingReport,
} from "../controllers/sessionController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

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
router.get("/:id/report", protectRoute, getReport);
router.get("/:id/report-history", protectRoute, getReportHistory);
router.get("/:id/report-full", protectRoute, getFullReport);
router.get("/:id/meeting-report", protectRoute, getMeetingReport);
router.get("/:id/analyses", protectRoute, getAnalyses);
router.get("/:id/snapshots", protectRoute, getSnapshotHistory);
router.post("/:id/analyze-progression", protectRoute, analyzeProgression);
router.post("/:id/audio-chunk", protectRoute, upload.single("audio"), uploadAudioChunk);
router.post("/:id/finalize-meeting", protectRoute, finalizeMeetingAndSendReports);
router.post("/:id/end", protectRoute, endSession);
router.delete("/:id", protectRoute, deleteSession);

export default router;
