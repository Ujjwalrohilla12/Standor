import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  listProblems,
  getProblemBySlug,
  runTests,
} from "../controllers/problemsController.js";

const router = express.Router();

router.get("/", protectRoute, listProblems);
router.get("/:title", protectRoute, getProblemBySlug);
router.post("/:title/run", protectRoute, runTests);

export default router;
