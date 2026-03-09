import express from "express";
import { googleAuth, getMe, googleAuthRedirect, googleAuthCallback } from "../controllers/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.post("/google", googleAuth);
router.get("/me", protectRoute, getMe);

export default router;
