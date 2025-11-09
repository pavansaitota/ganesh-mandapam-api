import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { getMandapamQR, updateMandapamQR } from "../controllers/mandapamqrController.js";

const router = express.Router();

// view QR → any logged in user
router.get("/:mandapam_id", verifyToken, getMandapamQR);

// update QR → only president / treasurer
router.put(
  "/:mandapam_id",
  verifyToken,
  allowRoles("President", "Treasurer"),
  updateMandapamQR
);

export default router;
