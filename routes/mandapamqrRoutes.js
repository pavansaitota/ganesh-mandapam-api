import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import {
  getMandapamQR,
  createMandapamQR,
  updateMandapamQR,
} from "../controllers/mandapamqrcontroller.js";

const router = express.Router();

// ✅ Fetch QR for a Mandapam
router.get("/:mandapam_id", verifyToken, getMandapamQR);

// ✅ Create QR (President / Treasurer)
router.post("/", verifyToken, allowRoles("President", "Treasurer"), createMandapamQR);

// ✅ Update QR (President / Treasurer)
router.put("/", verifyToken, allowRoles("President", "Treasurer"), updateMandapamQR);

export default router;
