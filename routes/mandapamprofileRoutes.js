import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { getMandapamProfile, updateMandapamProfile } from "../controllers/mandapmprofileController.js";

const router = express.Router();

// ✅ Get Mandapam Profile (No QR)
router.get("/:mandapam_id", verifyToken, getMandapamProfile);

// ✅ Update Mandapam Profile (President / Treasurer)
router.put(
  "/:mandapam_id",
  verifyToken,
  allowRoles("President", "Treasurer"),
  updateMandapamProfile
);

export default router;
