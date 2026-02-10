import express from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";

const router = express.Router();

// Admin ya frontend use ke liye endpoints
router.get("/config", getConfig);
router.post("/config", updateConfig);

export default router;
