import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { listRoles } from "../controllers/roleController.js";

const router = express.Router();

/* =====================================================
   GET /api/roles
   - Returns all available roles
   - Token required (optional)
   ===================================================== */
router.get("/", verifyToken, listRoles);

export default router;
