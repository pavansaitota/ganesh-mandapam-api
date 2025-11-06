import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { requestJoin, listJoinRequests, decideJoinRequest } from "../controllers/joinRequestController.js";

const router = express.Router();
router.post("/", verifyToken, requestJoin);
router.get("/mandapam/:mandapam_id", verifyToken, allowRoles("President","Vice President","Treasurer","Secretary"), listJoinRequests);
router.put("/:id/status", verifyToken, allowRoles("President"), decideJoinRequest);
export default router;
