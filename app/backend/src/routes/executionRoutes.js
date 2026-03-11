import express from "express";
import {
  getLanguages,
  executeCode,
} from "../controllers/executionController.js";

const router = express.Router();

router.get("/languages", getLanguages);
router.post("/execute", executeCode);

export default router;
