import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import {
  requestJoin,
  listJoinRequests,
  decideJoinRequest,
} from "../controllers/joinRequestController.js";

const router = express.Router();

/* =========================================================
   1️⃣  Send Join Request
   - Accessible by any authenticated user
   - Allows sending a join request with requested role
   ========================================================= */
router.post("/", verifyToken, requestJoin);

/* =========================================================
   2️⃣  List All Join Requests for a Mandapam
   - Accessible only by Mandapam management roles
   - President, Vice President, Treasurer, Secretary
   ========================================================= */
router.get(
  "/mandapam/:mandapam_id",
  verifyToken,
  allowRoles("President", "Vice President", "Treasurer", "Secretary"),
  listJoinRequests
);

/* =========================================================
   3️⃣  Approve / Reject Join Request
   - Only the President can make final decisions
   ========================================================= */
router.put(
  "/:id/status",
  verifyToken,
  allowRoles("President"),
  decideJoinRequest
);

export default router;
