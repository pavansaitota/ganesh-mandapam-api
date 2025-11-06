import express from "express";
import { createEvent, listEvents, getEvent } from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("President","Vice President","Treasurer","Secretary"), createEvent);
router.get("/", verifyToken, listEvents);
router.get("/:id", verifyToken, getEvent);

export default router;
