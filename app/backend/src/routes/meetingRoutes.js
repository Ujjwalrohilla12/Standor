import express from "express";
import {
  createMeeting,
  getMeeting,
  joinMeeting,
  guestJoinMeeting,
} from "../controllers/meetingController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Authenticated - create meeting
router.post("/", protectRoute, createMeeting);

// Public - verify meeting exists
router.get("/:code", getMeeting);

// Authenticated - join meeting
router.post("/:code/join", protectRoute, joinMeeting);

// Public - guest join meeting
router.post("/:code/guest-join", guestJoinMeeting);

export default router;
