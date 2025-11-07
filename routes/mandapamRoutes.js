import express from "express";
import { registerMandapam, getNearbyMandapams } from "../controllers/mandapamController.js";

const router = express.Router();

// Public: register a mandapam (you can decide to protect this route later)
router.post("/register", registerMandapam);

// Public: find nearby mandapams
router.get("/nearby", getNearbyMandapams);

export default router;
