import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { addDonation, listDonations, updateDonationStatus } from "../controllers/donationController.js";

const router = express.Router();
router.get("/", verifyToken, listDonations);
router.post("/", verifyToken, allowRoles("President","Vice President","Treasurer","Secretary","Volunteer"), addDonation);
router.put("/:id/status", verifyToken, allowRoles("President","Vice President","Treasurer"), updateDonationStatus);
export default router;
