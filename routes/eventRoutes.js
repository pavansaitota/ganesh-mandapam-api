import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { createEvent, updateEvent, listEvents, getEvent } from "../controllers/eventController.js";

const router = express.Router();

router.get("/", verifyToken, listEvents);
router.get("/:id", verifyToken, getEvent);

router.post(
  "/",
  verifyToken,
  allowRoles("President","Vice President","Treasurer","Secretary"),
  createEvent
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("President","Vice President","Treasurer","Secretary"),
  updateEvent
);

export default router;
