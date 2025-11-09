import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { addDonation, listDonations, updateDonationStatus } from "../controllers/donationController.js";

const router = express.Router();

// ✅ Anyone logged-in can view donation list
router.get("/", verifyToken, listDonations);

// ✅ User also can donate now (added "User")
router.post(
  "/",
  verifyToken,
  allowRoles(
    "President",
    "Vice President",
    "Treasurer",
    "Secretary",
    "Volunteer",
    "User"               // <—— added this
  ),
  addDonation
);

// ✅ Only management can approve / reject
router.put(
  "/:id/status",
  verifyToken,
  allowRoles("President","Vice President","Treasurer"),
  updateDonationStatus
);

export default router;
