import express from "express";
import {
  registerMandapam,
  getNearbyMandapams,
  getAllMandapams,
} from "../controllers/mandapamController.js";

const router = express.Router();

// ✅ Register new mandapam
router.post("/", registerMandapam);

// ✅ Get mandapams near location or by ID (fixed 0.5 km radius)
router.get("/", getNearbyMandapams);

// ✅ Get all mandapams (optional, for admin)
router.get("/all", getAllMandapams);

export default router;
