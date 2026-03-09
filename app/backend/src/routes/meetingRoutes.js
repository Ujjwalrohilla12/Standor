import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    getMeetingByCode,
    joinMeeting,
    guestJoinMeeting
} from "../controllers/meetingController.js";

const router = express.Router();

router.get("/:code", getMeetingByCode);
router.post("/:code/join", protectRoute, joinMeeting);
router.post("/:code/guest-join", guestJoinMeeting);

export default router;
