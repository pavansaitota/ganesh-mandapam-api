import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { uploadEventImage, getAllEventImages, listEventImages, getEventImageBlob } from "../controllers/eventImageController.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("President","Vice President","Treasurer","Secretary"), uploadEventImage);
router.get("/", verifyToken, getAllEventImages);
router.get("/event/:event_id", verifyToken, listEventImages);
router.get("/:id/blob", getEventImageBlob);

export default router;
